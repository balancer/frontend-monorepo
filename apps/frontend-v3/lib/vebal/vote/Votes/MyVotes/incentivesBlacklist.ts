import { AbiMap } from '@repo/lib/modules/web3/contracts/AbiMap'
import { Address, Hex } from 'viem'
import { mainnet } from 'viem/chains'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { useReadContracts } from '@repo/lib/shared/utils/wagmi'
import { onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import { bn } from '@repo/lib/shared/utils/numbers'
import { VoteListItem } from '@repo/lib/modules/vebal/vote/vote.types'
import { millisecondsToSeconds, nextThursday } from 'date-fns'
import { startOfDayUtc } from '@repo/lib/shared/utils/time'

type VoteInfo = {
  accountAddress: Address
  gaugeAddress: Address
  slope: bigint
  power: bigint
  end: bigint
}

const BLACKLISTED_ADDRESSES: Address[] = [
  '0xaF52695E1bB01A16D33D7194C28C42b10e0Dbec2', // Aura
]

export function canReceiveIncentives(address: Address) {
  return !BLACKLISTED_ADDRESSES.includes(address)
}

export function useBlacklistedVotes(votingPools: VoteListItem[]) {
  const activeVotingPools = votingPools.filter(pool => !pool.gauge.isKilled)

  const { blacklistedVotes, isLoading: votesAreLoading } = useVotes(activeVotingPools)
  const blacklistedVotesGroupedByGauge = blacklistedVotes
    .map(vote => {
      const votes = calculateCurrentUserVotes(vote)

      return { gaugeAddress: vote.gaugeAddress, votes }
    })
    .reduce(
      (acc, current) => {
        if (!acc[current.gaugeAddress]) acc[current.gaugeAddress] = bn(0)
        acc[current.gaugeAddress] = acc[current.gaugeAddress].plus(current.votes)
        return acc
      },
      {} as Record<string, BigNumber>
    )

  return {
    isLoading: votesAreLoading,
    blacklistedVotes: blacklistedVotesGroupedByGauge as Record<Address, BigNumber | undefined>,
  }
}

function useVotes(votingPools: VoteListItem[]) {
  const calls = BLACKLISTED_ADDRESSES.flatMap(blacklistedAddress => {
    return votingPools.map(
      votingPool =>
        ({
          chainId: mainnet.id,
          abi: AbiMap['balancer.gaugeControllerAbi'],
          address: mainnetNetworkConfig.contracts.gaugeController as Hex,
          functionName: 'vote_user_slopes',
          args: [blacklistedAddress, votingPool.gauge.address],
        }) as const
    )
  })

  const { data, isLoading } = useReadContracts({
    batchSize: 10_000, // 10kb batch ~ 75kb payload
    allowFailure: false,
    query: {
      ...onlyExplicitRefetch,
      enabled: true,
    },
    contracts: calls,
  })

  const blacklistedVotesResult = data || []

  const blacklistedVotes = blacklistedVotesResult.map((vote, i) => {
    const accountAddress = calls[i].args[0]
    const gaugeAddress = calls[i].args[1] as Address

    return { ...vote, accountAddress, gaugeAddress }
  })

  return { blacklistedVotes, isLoading }
}

function calculateCurrentUserVotes(vote: VoteInfo) {
  const slope = bn(vote.slope)
  const nextVoteTimestamp = millisecondsToSeconds(startOfDayUtc(nextThursday(new Date())).getTime())
  const lockEndInSeconds = Number(vote.end)

  return slope.times(lockEndInSeconds - nextVoteTimestamp)
}
