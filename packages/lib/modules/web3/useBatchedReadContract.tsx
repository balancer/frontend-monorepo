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
  const [state, setState] = useState({
    data: null as any,
    isLoading: true,
    isError: false,
    error: null as Error | null,
    isSuccess: false,
    status: 'idle' as 'idle' | 'loading' | 'success' | 'error',
  })

  const requestId = useMemo(
    () => `${config.address}-${config.functionName}-${config.chainId || 'default'}`,
    [config.address, config.functionName, config.chainId]
  )

  const fetchData = useCallback(async () => {
    if (config.query?.enabled === false || !config.address) {
      setState(prev => ({ ...prev, isLoading: false }))
      return
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      isError: false,
      error: null,
      isSuccess: false,
      status: 'loading',
    }))

    try {
      const result = await addRequest({
        id: requestId,
        type: 'single',
        call: {
          address: config.address,
          abi: config.abi,
          functionName: config.functionName,
          args: config.args,
          chainId: config.chainId,
          account: config.account,
        },
      })

      setState({
        data: result?.result,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
        status: 'success',
      })
    } catch (err) {
      setState({
        data: null,
        isLoading: false,
        isError: true,
        error: err as Error,
        isSuccess: false,
        status: 'error',
      })
    }
  }, [
    config.address,
    config.abi,
    config.functionName,
    config.args,
    config.chainId,
    config.account,
    config.query?.enabled,
    addRequest,
    requestId,
  ])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    ...state,
    refetch,
  }
}
