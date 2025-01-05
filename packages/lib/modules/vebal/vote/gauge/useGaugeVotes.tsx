import { useCallback, useMemo } from 'react'
import { oneWeekInMs, toUnixTimestamp } from '@repo/lib/shared/utils/time'
import { mainnet } from 'viem/chains'
import { AbiMap } from '@repo/lib/modules/web3/contracts/AbiMap'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { Hex } from 'viem'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { onlyExplicitRefetch } from '../../../../shared/utils/queries'
import { useReadContracts } from 'wagmi'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FIRST_WEEK_TIMESTAMP = 1648684800

export interface UserVotesData {
  end: bigint
  power: bigint
  slope: bigint
}

export interface RawVotesData {
  gaugeWeightThisPeriod?: { result?: bigint; status: string }
  gaugeWeightNextPeriod?: { result?: bigint; status: string }
  userVotes?: { result?: UserVotesData; status: string }
  lastUserVoteTime?: { result?: bigint; status: string }
  isKilled?: { result?: boolean; status: string }
}

export interface VotesData {
  votes: string
  votesNextPeriod: string
  userVotes: string
  lastUserVoteTime: number
  isKilled: boolean
}

function formatVotes(votesData: RawVotesData): VotesData {
  const votes = votesData.gaugeWeightThisPeriod?.result?.toString() || '0'
  const votesNextPeriod = votesData.gaugeWeightNextPeriod?.result?.toString() || '0'

  return {
    votes,
    votesNextPeriod,
    userVotes: votesData?.userVotes?.result?.power.toString() || '0',
    lastUserVoteTime: Number(votesData?.lastUserVoteTime?.result) || 0,
    isKilled: votesData?.isKilled?.result ?? false,
  }
}

const readContractsParams = {
  batchSize: 25_000, // 25kb batch ~ 190kb payload
  allowFailure: true,
  query: onlyExplicitRefetch,
} as const

function useGaugeRelativeWeightsWrite(
  gaugeAddresses: UseGaugeVotesParams['gaugeAddresses'],
  timestamp: number
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
        functionName: 'gauge_relative_weight_write',
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

  const thisWeekTimestamp = toUnixTimestamp(Math.floor(Date.now() / oneWeekInMs) * oneWeekInMs)

  const nextWeekTimestamp = useMemo(() => {
    return toUnixTimestamp(Math.floor((Date.now() + oneWeekInMs) / oneWeekInMs) * oneWeekInMs)
  }, [])

  const gaugeWeightThisPeriodQuery = useGaugeRelativeWeightsWrite(gaugeAddresses, thisWeekTimestamp)
  const gaugeWeightNextPeriodQuery = useGaugeRelativeWeightsWrite(gaugeAddresses, nextWeekTimestamp)
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
    isLoading,
  }
}
