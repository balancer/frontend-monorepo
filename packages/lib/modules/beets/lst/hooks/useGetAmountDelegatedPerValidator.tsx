'use client'

import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { useMulticall } from '@repo/lib/modules/web3/contracts/useMulticall'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useGetRate } from './useGetRate'
import { useGetStakedSonicData } from './useGetStakedSonicData'
import { useMemo } from 'react'
import { sfcAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { zeroAddress } from 'viem'

type Result = {
  [key: string]: {
    result: bigint
    status: string
  }
}

export function useGetAmountDelegatedPerValidator(chain: GqlChain) {
  const { isConnected } = useUserAccount()
  const { rate } = useGetRate(chain)
  const { data, loading } = useGetStakedSonicData()

  const chainId = getChainId(chain)
  const config = getNetworkConfig(chainId)

  const validatorIds = useMemo(() => {
    if (!loading && data) {
      return data.stsGetGqlStakedSonicData.delegatedValidators.map(v => v.validatorId)
    }

    return []
  }, [data, loading])

  const getStakeRequests = validatorIds.map(validatorId => {
    return {
      chainId,
      id: validatorId,
      abi: sfcAbi,
      address: config.contracts.beets?.sfcProxy || zeroAddress,
      functionName: 'getStake',
      args: [config.contracts.beets?.lstStakingProxy, validatorId],
      enabled: isConnected,
    }
  })

  const {
    results: stakeRequests,
    refetchAll,
    isLoading,
  } = useMulticall(getStakeRequests, {
    enabled: isConnected,
  })

  const amountResults = useMemo(() => {
    const results = stakeRequests[chainId]
    if (results?.isSuccess) {
      return results?.data as Result
    }

    return {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stakeRequests, isLoading])

  const amountDelegatedPerValidator = validatorIds.map(validatorId => ({
    validatorId,
    amountDelegated: amountResults[validatorId]?.result ?? 0n,
  }))

  function chooseValidatorsForUnstakeAmount(unstakeAmountShares: bigint) {
    const unstakeAmountAssets = (unstakeAmountShares * rate) / 10n ** 18n

    const validator = amountDelegatedPerValidator.find(
      validator => validator.amountDelegated > unstakeAmountAssets
    )

    // TODO: we should split the unstake amount across several validators down the line
    return [
      {
        validatorId: validator?.validatorId || '1',
        unstakeAmountShares,
      },
    ]
  }

  return {
    amountDelegatedPerValidator,
    stakeRequests,
    refetchAll,
    isLoading,
    chooseValidatorsForUnstakeAmount,
  }
}