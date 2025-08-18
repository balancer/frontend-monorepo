'use client'

import { Text } from '@chakra-ui/react'
import { getNativeAsset } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { useBalance } from 'wagmi'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { formatUnits } from 'viem'

interface NativeTokenBalanceProps {
  chain: GqlChain
}

export function NativeTokenBalance({ chain }: NativeTokenBalanceProps) {
  const { userAddress } = useUserAccount()
  const nativeAsset = getNativeAsset(chain)
  const networkConfig = getNetworkConfig(chain)

  const { data: balance } = useBalance({
    chainId: networkConfig.chainId,
    address: userAddress,
    query: {
      enabled: !!userAddress,
      staleTime: 30_000,
    },
  })

  if (!balance || bn(balance.value).isZero()) {
    return null
  }

  const formattedBalance = fNum('token', formatUnits(balance.value, nativeAsset.decimals))

  return (
    <Text color="gray.500" fontSize="sm" ml="auto">
      {formattedBalance} {nativeAsset.symbol}
    </Text>
  )
}
