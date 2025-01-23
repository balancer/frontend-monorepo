import { useBatch } from './BatchProvider'
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
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
    gcTime?: number
    refetchInterval?: number
  }
}) => {
  const { addRequest } = useBatch()
  const [state, setState] = useState({
    data: null as any,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    isSuccess: false,
    status: 'idle' as 'idle' | 'loading' | 'success' | 'error',
  })

  const { address, abi, functionName, args, chainId, account, query } = config
  const enabled = query?.enabled ?? true

  // Memoize the dependencies to prevent unnecessary re-renders
  const dependencies = useMemo(
    () => ({
      address,
      functionName,
      chainId: chainId || 'default',
      args: JSON.stringify(args),
    }),
    [address, functionName, chainId, args]
  )

  // Create a stable reference to the request configuration
  const requestConfig = useRef({
    id: '',
    type: 'single' as const,
    call: {
      address: '0x' as Address | undefined,
      abi: null as any,
      functionName: '',
      args: [] as any[],
      chainId: undefined as number | undefined,
      account: undefined as Address | undefined,
    },
  })

  // Update the request config when dependencies change
  useEffect(() => {
    requestConfig.current = {
      id: `${dependencies.address}-${dependencies.functionName}-${dependencies.chainId}-${dependencies.args}`,
      type: 'single',
      call: {
        address,
        abi,
        functionName,
        args,
        chainId,
        account,
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencies, abi, account])

  const fetchData = useCallback(async () => {
    if (!enabled || !address) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        status: 'idle',
      }))
      return
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      status: 'loading',
    }))

    try {
      const result = await addRequest({
        ...requestConfig.current,
        call: {
          ...requestConfig.current.call,
          address: address as Address,
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
  }, [enabled, address, addRequest])

  useEffect(() => {
    if (enabled) {
      fetchData()
    }
  }, [fetchData, enabled])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    ...state,
    refetch,
  }
}
