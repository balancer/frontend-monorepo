'use client'

import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from '@repo/lib/shared/utils/wagmi'
import { loopedSonicVaultAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { parseUnits } from 'viem'

export function useLoopsGetCollateralAndDebtForShares(sharesAmount: string, chain: GqlChain) {
  const { isConnected } = useUserAccount()
  const chainId = getChainId(chain)

  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const config = getNetworkConfig(chainId)

  const amountShares = sharesAmount ? BigInt(parseUnits(sharesAmount, 18).toString()) : 0n

  const query = useReadContract({
    chainId,
    abi: loopedSonicVaultAbi,
    address: config.contracts.beets?.loopedSonicVault,
    functionName: 'getCollateralAndDebtForShares',
    args: [amountShares],
    query: { enabled: isConnected && !shouldChangeNetwork && !!amountShares },
  })

  return {
    ...query,
    collateralInLst: query.data?.[0] ?? 0n,
  }
}
