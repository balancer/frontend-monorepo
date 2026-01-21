import { useMemo } from 'react'
import { getNetworkConfig, getChainId } from '@repo/lib/config/app.config'
import { reliquaryAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContracts } from '@repo/lib/shared/utils/wagmi'
import { formatUnits } from 'viem'
import { minutesToMilliseconds } from 'date-fns'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { sumBy } from 'lodash'
import { bn } from '@repo/lib/shared/utils/numbers'
import { ReliquaryFarmPosition } from '../ReliquaryProvider'

export type PendingRewardsResult = {
  rewards: { address: string; amount: string }[]
  relicRewards: { relicId: string; amount: string }[]
  relicIds: number[]
  numberOfRelics: number
  fBEETSTotalBalance: string
}

type Params = {
  chain: GqlChain
  farmIds: string[]
  relicPositions: ReliquaryFarmPosition[]
}

export function useGetPendingRewards({ chain, farmIds, relicPositions }: Params) {
  const chainId = getChainId(chain)
  const config = getNetworkConfig(chainId)
  const { isConnected } = useUserAccount()

  const filteredPositions = useMemo(
    () => relicPositions.filter(position => farmIds.includes(position.farmId)),
    [relicPositions, farmIds]
  )

  const contracts = useMemo(
    () =>
      filteredPositions.map(position => ({
        chainId,
        abi: reliquaryAbi,
        address: config.contracts.beets?.reliquary,
        functionName: 'pendingReward' as const,
        args: [BigInt(position.relicId)] as const,
      })),
    [chainId, config.contracts.beets?.reliquary, filteredPositions]
  )

  const query = useReadContracts({
    contracts,
    query: {
      enabled: isConnected && contracts.length > 0 && !!config.contracts.beets?.reliquary,
      refetchInterval: minutesToMilliseconds(5),
    },
  })

  const data = useMemo<PendingRewardsResult>(() => {
    if (!query.data || query.data.length === 0) {
      return {
        rewards: [],
        relicRewards: [],
        relicIds: [],
        numberOfRelics: 0,
        fBEETSTotalBalance: '0',
      }
    }

    const beetsAddress = config.tokens.addresses.beets!
    const rewards = query.data.map((reward, index) => {
      if (reward.status !== 'success') return null
      const amount = formatUnits(reward.result as bigint, 18)
      const position = filteredPositions[index]

      return {
        id: position?.farmId,
        relicId: position?.relicId,
        address: beetsAddress,
        amount,
        fBEETSBalance: position?.amount ?? '0',
      }
    })

    const validRewards = rewards.filter(
      (reward): reward is NonNullable<typeof reward> => reward !== null
    )
    const relicIds = validRewards.map(reward => bn(reward.relicId).toNumber())
    const totalAmount = sumBy(validRewards, reward => bn(reward.amount).toNumber()).toString()

    return {
      rewards: [{ address: beetsAddress, amount: totalAmount }],
      relicRewards: validRewards.map(reward => ({
        relicId: reward.relicId,
        amount: reward.amount,
      })),
      relicIds,
      numberOfRelics: relicIds.length,
      fBEETSTotalBalance: sumBy(validRewards, reward =>
        bn(reward.fBEETSBalance).toNumber()
      ).toString(),
    }
  }, [config.tokens.addresses.beets, filteredPositions, query.data])

  return {
    ...query,
    data,
  }
}
