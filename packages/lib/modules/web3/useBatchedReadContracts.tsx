import { useBatch } from './BatchProvider'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { Address } from 'viem'

export const useBatchedReadContracts = (config: {
  contracts: {
    address: Address
    abi: any[]
    functionName: string
    args: any[]
    chainId?: number
    account?: Address
  }[]
  query?: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    refetchInterval?: number
  }
}) => {
  const { addRequest } = useBatch()
  const [data, setData] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isError, setIsError] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const { contracts, query } = config

  // Memoize the request ID to avoid unnecessary re-renders
  const requestId = useMemo(
    () => `batch-${contracts.map(c => c.functionName).join('-')}`,
    [contracts]
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
        type: 'multiple',
        calls: contracts.map(call => ({
          address: call.address,
          abi: call.abi,
          functionName: call.functionName,
          args: call.args,
          chainId: call.chainId,
          account: call.account,
        })),
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
  }, [contracts, query?.enabled, addRequest, requestId])

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
