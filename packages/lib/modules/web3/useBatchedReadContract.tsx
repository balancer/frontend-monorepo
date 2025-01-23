import { useBatch } from './BatchProvider'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { Address } from 'viem'

export const useBatchedReadContract = (config: {
  address: Address | undefined
  abi: any
  functionName: string
  args: any[]
  chainId?: number
  account?: Address
  query?: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    refetchInterval?: number
  }
}) => {
  const { addRequest } = useBatch()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isError, setIsError] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const { address, abi, functionName, args, chainId, account, query } = config

  // Memoize the request ID to avoid unnecessary re-renders
  const requestId = useMemo(
    () => `${functionName}-${address}-${chainId || 'default'}`,
    [functionName, address, chainId]
  )

  const fetchData = useCallback(async () => {
    if (query?.enabled === false) return

    setIsLoading(true)
    setIsError(false)
    setError(null)
    setIsSuccess(false)
    setStatus('loading')

    try {
      const result = await addRequest({
        id: requestId,
        type: 'single',
        call: {
          address,
          abi,
          functionName,
          args,
          chainId,
          account,
        },
      })
      setData(result)
      setIsSuccess(true)
      setStatus('success')
    } catch (err) {
      setIsError(true)
      setError(err as Error)
      setStatus('error')
    } finally {
      setIsLoading(false)
    }
  }, [address, abi, functionName, args, chainId, account, query?.enabled, addRequest, requestId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    status,
    refetch,
  }
}
