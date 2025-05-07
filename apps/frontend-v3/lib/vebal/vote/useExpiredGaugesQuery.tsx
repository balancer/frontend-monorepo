import { useReadContracts } from 'wagmi'
import { mainnet } from 'viem/chains'
import { AbiMap } from '@repo/lib/modules/web3/contracts/AbiMap'
import { Hex } from 'viem'
import { onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import { useMemo } from 'react'

const readContractsParams = {
  batchSize: 10_000, // 10kb batch ~ 75kb payload
  allowFailure: true,
  query: onlyExplicitRefetch,
} as const

function useExpiredGaugesQuery(gaugeAddresses: UseExpiredGaugesParams['gaugeAddresses']) {
  return useReadContracts({
    ...readContractsParams,
    query: {
      ...readContractsParams.query,
    },
    contracts: gaugeAddresses.map(gaugeAddress => {
      return {
        chainId: mainnet.id,
        abi: AbiMap['balancer.liquidityGaugeV5Abi'],
        address: gaugeAddress as Hex,
        functionName: 'is_killed',
        args: [],
      } as const
    }),
  })
}

export interface UseExpiredGaugesParams {
  gaugeAddresses: string[]
}

export function useExpiredGauges({ gaugeAddresses }: UseExpiredGaugesParams) {
  const expiredGaugesQuery = useExpiredGaugesQuery(gaugeAddresses)

  const expiredGauges = useMemo(() => {
    if (expiredGaugesQuery.isLoading) {
      return undefined
    }

    return gaugeAddresses.filter((_gaugeAddress, index) => {
      const isKilled = (expiredGaugesQuery.data ?? [])[index]
      return isKilled.result
    })
  }, [expiredGaugesQuery.data, expiredGaugesQuery.isLoading, gaugeAddresses])

  return {
    expiredGauges,
    isLoading: expiredGaugesQuery.isLoading,
    refetch: expiredGaugesQuery.refetch,
  }
}
