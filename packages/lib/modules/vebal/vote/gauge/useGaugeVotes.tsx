import { ChainContractConfig, useMulticall } from '@repo/lib/modules/web3/contracts/useMulticall'
import { useMemo } from 'react'
import { oneWeekInMs, oneWeekInSecs, toUnixTimestamp } from '@repo/lib/shared/utils/time'
import { mainnet } from 'viem/chains'
import { AbiMap } from '@repo/lib/modules/web3/contracts/AbiMap'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { Hex } from 'viem'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { compact } from 'lodash'
import { onlyExplicitRefetch } from '../../../../shared/utils/queries'

const FIRST_WEEK_TIMESTAMP = 1648684800

export interface UserVotesData {
  end: bigint
  power: bigint
  slope: bigint
}

export interface RawVotesData {
  gaugeWeightThisPeriod: { result?: bigint; status: string }
  gaugeWeightNextPeriod: { result?: bigint; status: string }
  userVotes?: { result?: UserVotesData; status: string }
  lastUserVoteTime?: { result?: bigint; status: string }
}

export interface VotesData {
  votes: string
  votesNextPeriod: string
  userVotes: string
  lastUserVoteTime: number
}

export type RawVotesDataMap = Record<string, RawVotesData>

function formatVotes(votesData: RawVotesData): VotesData {
  const votes = votesData.gaugeWeightThisPeriod.result?.toString() || '0'
  const votesNextPeriod = votesData.gaugeWeightNextPeriod.result?.toString() || '0'

  return {
    votes,
    votesNextPeriod,
    userVotes: votesData?.userVotes?.result?.power.toString() || '0',
    lastUserVoteTime: Number(votesData?.lastUserVoteTime?.result) || 0,
  }
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

  const gaugeRequests: ChainContractConfig[] = useMemo(() => {
    return gaugeAddresses.flatMap(gaugeAddress => {
      const requests = compact([
        {
          path: 'gaugeWeightThisPeriod',
          fn: 'gauge_relative_weight_write',
          args: [gaugeAddress, thisWeekTimestamp],
        },
        {
          path: 'gaugeWeightNextPeriod',
          fn: 'gauge_relative_weight_write',
          args: [gaugeAddress, nextWeekTimestamp],
        },
        isConnected && {
          path: 'userVotes',
          fn: 'vote_user_slopes',
          args: [userAddress, gaugeAddress],
        },
        isConnected && {
          path: 'lastUserVoteTime',
          fn: 'last_user_vote',
          args: [userAddress, gaugeAddress],
        },
      ]).filter(Boolean)

      return requests.map(v => ({
        chainId: mainnet.id,
        id: `${gaugeAddress}.${v.path}`,
        abi: AbiMap['balancer.gaugeControllerAbi'] as any,
        address: mainnetNetworkConfig.contracts.gaugeController as Hex,
        functionName: v.fn,
        args: v.args,
      }))
    })
  }, [gaugeAddresses, thisWeekTimestamp, nextWeekTimestamp, isConnected, userAddress])

  const { results, refetchAll, isLoading } = useMulticall(gaugeRequests, { ...onlyExplicitRefetch })

  const gaugeVotes = useMemo(() => {
    const mainnetResults = results[mainnetNetworkConfig.chainId]

    if (!mainnetResults) {
      // handle empty
      return undefined
    }

    if (mainnetResults.status === 'error') {
      // handle error
      return undefined
    }

    if (mainnetResults.status === 'pending') {
      // handle loading
      return undefined
    }

    const data = mainnetResults.data as RawVotesDataMap

    const result: Record<string, VotesData> = Object.fromEntries(
      Object.keys(data).map(address => [address, formatVotes(data[address])])
    )

    return result
  }, [results])

  return {
    gaugeVotes,
    refetchAll,
    isLoading,
  }
}
