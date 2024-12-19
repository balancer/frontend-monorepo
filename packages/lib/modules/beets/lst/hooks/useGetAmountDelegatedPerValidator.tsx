'use client'

import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { sonicStakingAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { useMulticall } from '@repo/lib/modules/web3/contracts/useMulticall'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useReadContract } from 'wagmi'

export function useGetAmountDelegatedPerValidator(chain: GqlChain) {
  const validatorIds = [...Array(100).keys()] // we query validator ids from 0 to 99 for the moment
  const { isConnected, userAddress } = useUserAccount()
  const chainId = getChainId(chain)
  const config = getNetworkConfig(chainId)

  const rateQuery = useReadContract({
    chainId,
    abi: sonicStakingAbi,
    address: config.contracts.beets?.lstStakingProxy,
    functionName: 'getRate',
    args: [],
    query: { enabled: true },
  })

  const getStakeRequests = validatorIds.map(validatorId => {
    return {
      chainId,
      id: `${validatorId}`,
      abi: [
        {
          type: 'function',
          inputs: [
            { name: 'user', internalType: 'address', type: 'address' },
            { name: 'validatorId', internalType: 'uint256', type: 'uint256' },
          ],
          name: 'getStake',
          outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
          stateMutability: 'view',
        },
      ],
      address: config.contracts.beets?.sfc,
      functionName: 'getStake',
      args: [userAddress, validatorId],
    }
  })

  const { results, refetchAll, isLoading } = useMulticall(getStakeRequests, {
    enabled: isConnected,
  })

  // hook this up with the results from the multicall
  const amountDelegatedPerValidator = validatorIds.map(validatorId => ({
    validatorId,
    amountDelegated: 0n,
  }))

  function chooseValidatorsForUnstakeAmount(unstakeAmountShares: bigint) {
    const rate = rateQuery.data || 1n
    const unstakeAmountAssets = (unstakeAmountShares * rate) / 10n ** 18n

    const validator = amountDelegatedPerValidator.find(
      validator => validator.amountDelegated > unstakeAmountAssets
    )

    // TODO: we should split the unstake amount across several validators down the line
    return [
      {
        validatorId: validator?.validatorId || 0,
        unstakeAmountAssets,
      },
    ]
  }

  return {
    amountDelegatedPerValidator,
    results,
    refetchAll,
    isLoading,
    chooseValidatorsForUnstakeAmount,
  }
}
