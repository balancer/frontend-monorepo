/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { usePublicClient } from 'wagmi'

type BatchRequest = {
  id: string // Unique ID for each request
  type: 'single' | 'multiple' // Type of request
  call?: any // Single contract call
  calls?: any[] // Multiple contract calls
  resolve: (value: any) => void // Resolve function for the promise
  reject: (reason?: any) => void // Reject function for the promise
}

type BatchContextType = {
  addRequest: (request: Omit<BatchRequest, 'resolve' | 'reject'>) => Promise<any>
}

const BatchContext = createContext<BatchContextType | null>(null)

export function BatchProvider({ children }: { children: React.ReactNode }) {
  const publicClient = usePublicClient()
  const [queue, setQueue] = useState<BatchRequest[]>([])
  const processingRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const processQueue = useCallback(async () => {
    if (processingRef.current || queue.length === 0 || !publicClient) return

    processingRef.current = true
    const currentQueue = [...queue]
    setQueue([]) // Clear the queue

    try {
      // Flatten all calls from the batch requests
      const allCalls = currentQueue
        .flatMap(req => (req.type === 'single' ? [req.call] : req.calls))
        .filter(call => call?.address) // Filter out calls with undefined address

      if (allCalls.length === 0) {
        currentQueue.forEach(req => {
          req.resolve({ result: undefined })
        })
        return
      }

      // Execute the batched calls using multicall
      const results = await publicClient.multicall({
        contracts: allCalls,
        allowFailure: true,
      })

      // Group results back into their original requests
      let resultIndex = 0
      currentQueue.forEach(req => {
        try {
          if (req.type === 'single') {
            const result = results?.[resultIndex]
            req.resolve(result?.status === 'success' ? result : { result: undefined })
            resultIndex += 1
          } else {
            const requestResults = results?.slice(resultIndex, resultIndex + req.calls!.length)
            const mappedResults = requestResults?.map(r =>
              r?.status === 'success' ? r : { result: undefined }
            )
            resultIndex += req.calls!.length
            req.resolve(mappedResults)
          }
        } catch (error) {
          console.error('Error processing batch result:', error)
          req.resolve({ result: undefined })
        }
      })
    } catch (error) {
      console.error('Error in batch processing:', error)
      // Resolve all requests with undefined on error
      currentQueue.forEach(req => {
        req.resolve({ result: undefined })
      })
    } finally {
      processingRef.current = false
      // Process any new items that may have been added while we were processing
      if (queue.length > 0) {
        processQueue()
      }
    }
  }, [queue, publicClient])

  const addRequest = useCallback(
    (request: Omit<BatchRequest, 'resolve' | 'reject'>) => {
      return new Promise((resolve, reject) => {
        setQueue(prev => [...prev, { ...request, resolve, reject }])

        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // Set a new timeout to process the queue
        timeoutRef.current = setTimeout(() => {
          processQueue()
        }, 50) // 50ms debounce
      })
    },
    [processQueue]
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const value = useMemo(() => ({ addRequest }), [addRequest])

  return <BatchContext.Provider value={value}>{children}</BatchContext.Provider>
}

export const useBatch = () => {
  const context = useContext(BatchContext)
  if (!context) {
    throw new Error('useBatch must be used within a BatchProvider')
  }
  return context
}
