import { useBatch } from './BatchProvider'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { Address } from 'viem'

export const useBatchedReadContracts = (config: {
  contracts: {
    address: Address | undefined
    abi: any
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
  const [state, setState] = useState({
    data: null as any[] | null,
    isLoading: true,
    isError: false,
    error: null as Error | null,
    isSuccess: false,
    status: 'idle' as 'idle' | 'loading' | 'success' | 'error',
  })

  const requestId = useMemo(() => {
    const validContracts = config.contracts.filter(c => c.address)
    return `batch-${validContracts.map(c => `${c.address}-${c.functionName}`).join('-')}`
  }, [config.contracts])

  const fetchData = useCallback(async () => {
    if (config.query?.enabled === false) {
      setState(prev => ({ ...prev, isLoading: false }))
      return
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      isError: false,
      error: null,
      isSuccess: false,
      status: 'loading' as const,
    }))

    try {
      // Filter out contracts with undefined addresses
      const validContracts = config.contracts.filter(contract => contract.address)

      if (validContracts.length === 0) {
        setState(prev => ({
          ...prev,
          data: [],
          isLoading: false,
          isSuccess: true,
          status: 'success' as const,
        }))
        return
      }

      const result = await addRequest({
        id: requestId,
        type: 'multiple',
        calls: validContracts.map(call => ({
          address: call.address,
          abi: call.abi,
          functionName: call.functionName,
          args: call.args,
          chainId: call.chainId,
          account: call.account,
        })),
      })

      // Map results back to original contract positions
      const resultMap = new Map(
        validContracts.map((contract, index) => [
          `${contract.address}-${contract.functionName}`,
          result?.[index]?.result,
        ])
      )

      const finalResults = config.contracts.map(contract =>
        contract.address ? resultMap.get(`${contract.address}-${contract.functionName}`) : undefined
      )

      setState({
        data: finalResults,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
        status: 'success' as const,
      })
    } catch (err) {
      console.error('Error in batch contract read:', err)
      setState({
        data: config.contracts.map(() => undefined),
        isLoading: false,
        isError: true,
        error: err as Error,
        isSuccess: false,
        status: 'error' as const,
      })
    }
  }, [config.contracts, config.query?.enabled, addRequest, requestId])

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
