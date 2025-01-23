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
  const BATCH_TIMEOUT = 100 // ms

  // Keep track of in-flight requests to deduplicate them
  const requestCache = useRef(new Map<string, Promise<any>>())

  useEffect(() => {
    queueRef.current = queue
    if (queue.length > 0) {
      console.log('[BatchProvider] Queue updated:', {
        size: queue.length,
        requests: queue.map(req => ({
          id: req.id,
          type: req.type,
          hasCall: !!req.call,
          hasCalls: !!req.calls,
        })),
      })
    }
  }, [queue])

  const processQueue = useCallback(async () => {
    if (!publicClient) {
      console.error('[BatchProvider] No publicClient available')
      return
    }

    if (processingRef.current) {
      console.log('[BatchProvider] Already processing queue')
      return
    }

    if (queueRef.current.length === 0) {
      console.log('[BatchProvider] Queue is empty')
      return
    }

    try {
      processingRef.current = true
      const currentQueue = [...queueRef.current]
      console.log(`[BatchProvider] Processing ${currentQueue.length} requests`)
      setQueue([]) // Clear the queue

      // Deduplicate calls by stringifying them
      const uniqueCalls = new Map<string, { call: any; requests: BatchRequest[] }>()

      currentQueue.forEach(req => {
        if (req.type === 'single' && req.call) {
          const key = JSON.stringify({
            address: req.call.address,
            functionName: req.call.functionName,
            args: req.call.args,
            chainId: req.call.chainId,
          })

          if (!uniqueCalls.has(key)) {
            uniqueCalls.set(key, { call: req.call, requests: [] })
          }
          uniqueCalls.get(key)!.requests.push(req)
        }
      })

      const allCalls = Array.from(uniqueCalls.values())
        .map(({ call }) => call)
        .filter(call => {
          if (!call?.address) {
            console.warn('[BatchProvider] Call missing address:', call)
            return false
          }
          return true
        })

      console.log(
        `[BatchProvider] Batching ${allCalls.length} unique calls:`,
        allCalls.map(call => ({
          address: call.address,
          functionName: call.functionName,
        }))
      )

      if (allCalls.length === 0) {
        console.warn('[BatchProvider] No valid calls to process')
        currentQueue.forEach(req => req.resolve({ result: undefined }))
        return
      }

      const results = await publicClient.multicall({
        contracts: allCalls,
        allowFailure: true,
      })

      console.log(`[BatchProvider] Received ${results?.length} results`)

      // Map results back to the original requests
      let resultIndex = 0
      Array.from(uniqueCalls.values()).forEach(({ requests }) => {
        try {
          const result = results?.[resultIndex]
          requests.forEach(req => {
            req.resolve(result?.status === 'success' ? result : { result: undefined })
          })
          resultIndex += 1
        } catch (error) {
          console.error('[BatchProvider] Error processing result:', error)
          requests.forEach(req => req.resolve({ result: undefined }))
        }
      })
    } catch (error) {
      console.error('[BatchProvider] Error in batch processing:', error)
      queueRef.current.forEach(req => req.resolve({ result: undefined }))
    } finally {
      processingRef.current = false
      if (queueRef.current.length > 0) {
        processQueue()
      }
    }
  }, [publicClient])

  const addRequest = useCallback(
    (request: Omit<BatchRequest, 'resolve' | 'reject'>) => {
      // Create a cache key for the request
      const cacheKey = JSON.stringify({
        address: request.call?.address,
        functionName: request.call?.functionName,
        args: request.call?.args,
        chainId: request.call?.chainId,
      })

      // Check if we have a cached promise for this request
      const cachedPromise = requestCache.current.get(cacheKey)
      if (cachedPromise) {
        console.log('[BatchProvider] Using cached request:', {
          id: request.id,
          type: request.type,
          call: request.call
            ? {
                address: request.call.address,
                functionName: request.call.functionName,
              }
            : null,
        })
        return cachedPromise
      }

      const promise = new Promise((resolve, reject) => {
        setQueue(prev => [...prev, { ...request, resolve, reject }])

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          processQueue()
          // Clear the cache after processing
          requestCache.current.delete(cacheKey)
        }, BATCH_TIMEOUT)
      })

      // Cache the promise
      requestCache.current.set(cacheKey, promise)

      console.log('[BatchProvider] Adding new request:', {
        id: request.id,
        type: request.type,
        call: request.call
          ? {
              address: request.call.address,
              functionName: request.call.functionName,
            }
          : null,
      })

      return promise
    },
    [processQueue]
  )

  const value = useMemo(() => ({ addRequest }), [addRequest])

  if (!publicClient) {
    console.error('[BatchProvider] No publicClient available')
    return null
  }

  return <BatchContext.Provider value={value}>{children}</BatchContext.Provider>
}

export const useBatch = () => {
  const context = useContext(BatchContext)
  if (!context) {
    throw new Error('useBatch must be used within a BatchProvider')
  }
  return context
}
