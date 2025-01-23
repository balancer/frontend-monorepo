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
  const queueRef = useRef<BatchRequest[]>([])

  useEffect(() => {
    queueRef.current = queue
  }, [queue])

  const processQueue = useCallback(async () => {
    if (processingRef.current || queueRef.current.length === 0 || !publicClient) return

    processingRef.current = true
    const currentQueue = [...queueRef.current]
    setQueue([]) // Clear the queue

    try {
      const allCalls = currentQueue
        .flatMap(req => (req.type === 'single' ? [req.call] : req.calls))
        .filter(call => call?.address)

      if (allCalls.length === 0) {
        currentQueue.forEach(req => {
          req.resolve({ result: undefined })
        })
        return
      }

      const results = await publicClient.multicall({
        contracts: allCalls,
        allowFailure: true,
      })

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
      currentQueue.forEach(req => {
        req.resolve({ result: undefined })
      })
    } finally {
      processingRef.current = false
      if (queueRef.current.length > 0) {
        processQueue()
      }
    }
  }, [publicClient])

  const addRequest = useCallback(
    (request: Omit<BatchRequest, 'resolve' | 'reject'>) => {
      return new Promise((resolve, reject) => {
        setQueue(prev => [...prev, { ...request, resolve, reject }])

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(processQueue, 50)
      })
    },
    [processQueue]
  )

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
