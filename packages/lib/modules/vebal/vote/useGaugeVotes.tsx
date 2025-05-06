import { useCallback, useMemo } from 'react'
import { oneWeekInMs, toUnixTimestamp } from '@repo/lib/shared/utils/time'
import { mainnet } from 'viem/chains'
import { AbiMap } from '@repo/lib/modules/web3/contracts/AbiMap'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { Hex } from 'viem'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { onlyExplicitRefetch } from '../../../shared/utils/queries'
import { useReadContracts } from 'wagmi'
import { UserVotesData } from '@repo/lib/modules/vebal/vote/vote.types'
import { shouldUseAnvilFork } from '@repo/lib/config/app.config'

export interface RawVotesData {
  gaugeWeightThisPeriod?: { result?: bigint; status: string }
  gaugeWeightNextPeriod?: { result?: bigint; status: string }
  userVotes?: { result?: UserVotesData; status: string }
  lastUserVoteTime?: { result?: bigint; status: string }
}

export interface VotesData {
  votes: string
  votesNextPeriod: string
  userVotes: string
  lastUserVoteTime: number
}

function formatVotes(votesData: RawVotesData): VotesData {
  const votes = votesData.gaugeWeightThisPeriod?.result?.toString() || '0'
  const votesNextPeriod = votesData.gaugeWeightNextPeriod?.result?.toString() || '0'

  return {
    votes,
    votesNextPeriod,
    userVotes: votesData?.userVotes?.result?.power.toString() || '0', // 6000n = 60.00%
    lastUserVoteTime: Number(votesData?.lastUserVoteTime?.result) || 0,
  }
}

const readContractsParams = {
  batchSize: 10_000, // 10kb batch ~ 75kb payload
  allowFailure: true,
  query: onlyExplicitRefetch,
} as const

function useGaugeRelativeWeightsWrite(
  gaugeAddresses: UseGaugeVotesParams['gaugeAddresses'],
  timestamp: number
) {
  return useReadContracts({
    ...readContractsParams,
    query: {
      ...readContractsParams.query,
      enabled: true,
    },
    contracts: gaugeAddresses.map(gaugeAddress => {
      return {
        chainId: mainnet.id,
        abi: AbiMap['balancer.gaugeControllerAbi'],
        address: mainnetNetworkConfig.contracts.gaugeController as Hex,
        // Write function is avoided in anvil fork mode cause it is very slow
        functionName: shouldUseAnvilFork ? 'gauge_relative_weight' : 'gauge_relative_weight_write',
        args: [gaugeAddress, timestamp],
      } as const
    }),
  })
}

function useVoteUserSlopes(
  gaugeAddresses: UseGaugeVotesParams['gaugeAddresses'],
  userAddress: string
) {
  const { isConnected } = useUserAccount()
  return useReadContracts({
    ...readContractsParams,
    query: {
      ...readContractsParams.query,
      enabled: isConnected,
    },
    contracts: gaugeAddresses.map(gaugeAddress => {
      return {
        chainId: mainnet.id,
        abi: AbiMap['balancer.gaugeControllerAbi'],
        address: mainnetNetworkConfig.contracts.gaugeController as Hex,
        functionName: 'vote_user_slopes',
        args: [userAddress, gaugeAddress],
      } as const
    }),
  })
}

function useLastUserVotes(
  gaugeAddresses: UseGaugeVotesParams['gaugeAddresses'],
  userAddress: string
) {
  const { isConnected } = useUserAccount()
  return useReadContracts({
    ...readContractsParams,
    query: {
      ...readContractsParams.query,
      enabled: isConnected,
    },
    contracts: gaugeAddresses.map(gaugeAddress => {
      return {
        chainId: mainnet.id,
        abi: AbiMap['balancer.gaugeControllerAbi'],
        address: mainnetNetworkConfig.contracts.gaugeController as Hex,
        functionName: 'last_user_vote',
        args: [userAddress, gaugeAddress],
      } as const
    }),
  })
}

export interface UseGaugeVotesParams {
  gaugeAddresses: string[]
}

export function useGaugeVotes({ gaugeAddresses }: UseGaugeVotesParams) {
  const { userAddress, isConnected } = useUserAccount()

  // FIXME: [JUANJO] should this be calculated on thursday?
  const thisWeek = Math.floor(Date.now() / oneWeekInMs) * oneWeekInMs
  const gaugeWeightThisPeriodQuery = useGaugeRelativeWeightsWrite(
    gaugeAddresses,
    toUnixTimestamp(thisWeek)
  )

  const nextWeek = thisWeek + oneWeekInMs
  const gaugeWeightNextPeriodQuery = useGaugeRelativeWeightsWrite(
    gaugeAddresses,
    toUnixTimestamp(nextWeek)
  )

  const userVotesQuery = useVoteUserSlopes(isConnected ? gaugeAddresses : [], userAddress)
  const lastUserVotesQuery = useLastUserVotes(isConnected ? gaugeAddresses : [], userAddress)

  const refetchAll = useCallback(() => {
    return Promise.all([
      gaugeWeightThisPeriodQuery.refetch(),
      gaugeWeightNextPeriodQuery.refetch(),
      userVotesQuery.refetch(),
      lastUserVotesQuery.refetch(),
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gaugeWeightThisPeriodQuery.refetch,
    gaugeWeightNextPeriodQuery.refetch,
    userVotesQuery.refetch,
    lastUserVotesQuery.refetch,
  ])

  const isLoading =
    gaugeWeightThisPeriodQuery.isLoading ||
    gaugeWeightNextPeriodQuery.isLoading ||
    userVotesQuery.isLoading ||
    lastUserVotesQuery.isLoading

  const isRefetching =
    gaugeWeightThisPeriodQuery.isRefetching ||
    gaugeWeightNextPeriodQuery.isRefetching ||
    userVotesQuery.isRefetching ||
    lastUserVotesQuery.isRefetching

  const gaugeVotes = useMemo(() => {
    if (isLoading) {
      return undefined
    }

    const result: Record<string, VotesData> = Object.fromEntries(
      gaugeAddresses.map((address, index) => {
        const gaugeWeightThisPeriod = (gaugeWeightThisPeriodQuery.data ?? [])[index]
        const gaugeWeightNextPeriod = (gaugeWeightNextPeriodQuery.data ?? [])[index]
        const userVotes = (userVotesQuery.data ?? [])[index]
        const lastUserVoteTime = (lastUserVotesQuery.data ?? [])[index]

        return [
          address,
          formatVotes({
            gaugeWeightThisPeriod,
            gaugeWeightNextPeriod,
            userVotes,
            lastUserVoteTime,
          }),
        ]
      })
    )

    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gaugeWeightThisPeriodQuery.data,
    gaugeWeightNextPeriodQuery.data,
    userVotesQuery.data,
    lastUserVotesQuery.data,
    isLoading,
    gaugeAddresses,
  ])

  return {
    gaugeVotes,
    refetchAll,
    isLoading: isLoading || isRefetching,
  }
}
