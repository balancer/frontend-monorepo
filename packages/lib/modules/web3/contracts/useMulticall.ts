import { useQueries } from '@tanstack/react-query'
import { groupBy, keyBy, set } from 'lodash'
import { ContractFunctionParameters } from 'viem'
import { multicall } from 'wagmi/actions'
import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import { SupportedChainId } from '@repo/lib/config/config.types'

export type ChainContractConfig = ContractFunctionParameters & {
  chainId: SupportedChainId
  id: string
}

type Options = {
  // react-query options
  enabled?: boolean
  refetchOnMount?: boolean
  refetchOnReconnect?: boolean
  refetchOnWindowFocus?: boolean

  // multicall options
  batchSize?: number
}

export function useMulticall(
  multicallRequests: ChainContractConfig[],
  { batchSize, ...options }: Options = {}
) {
  const config = useConfig()
  // Want the results for each chainId to be independent of each other so we don't have
  // a large blob of queries that resolves at once, but have to option to have the results
  // of each set of multicalls for each chainId to 'stream' through

  // first group all the requests passed in per chain
  const multicallsPerChain = groupBy(multicallRequests, 'chainId')

  // key order is preserved
  const suppliedChains = Object.keys(multicallsPerChain)

  const multicallResults = useQueries({
    queries: suppliedChains.map(chain => {
      const multicalls = multicallsPerChain[chain]
      return {
        queryFn: async () => {
          const results = await multicall(config, {
            contracts: multicalls,
            chainId: Number(chain),
            batchSize,
          })

          // map the result to its id based on the call index
          const idMappedResults = results
            .map((result, i) => ({ ...result, id: multicalls[i].id }))
            .reduce((o, { id, ...rest }) => set(o, id, rest), {})
          return idMappedResults
        },
        queryKey: multicalls,
        ...options,
      }
    }),
  })

  const refetchAll = useCallback(() => {
    multicallResults.forEach(result => result.refetch())
  }, [multicallResults])

  return {
    results: keyBy(
      multicallResults.map((result, i) => {
        return { ...result, chainId: suppliedChains[i] }
      }),
      'chainId'
    ),
    isLoading: multicallResults.some(result => result.isLoading),
    refetchAll,
  }
}
