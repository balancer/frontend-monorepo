'use client'

import { Text } from '@chakra-ui/react'
import { getNativeAsset } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { useBalance } from 'wagmi'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { formatUnits } from 'viem'
import { getGqlChain } from '@repo/lib/config/app.config'

interface NativeTokenBalanceProps {
  chain: GqlChain
  fontColor?: string
}

export function NativeTokenBalance({ chain, fontColor }: NativeTokenBalanceProps) {
  const { userAddress, chainId } = useUserAccount()
  const nativeAsset = getNativeAsset(chain)
  const networkConfig = getNetworkConfig(chain)
  const connectedChain = chainId ? getGqlChain(chainId) : undefined

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
    <Text
      color={
        fontColor ||
        (connectedChain && connectedChain === chain ? 'font.primary' : 'font.secondary')
      }
      fontSize="sm"
      ml="auto"
    >
      {formattedBalance} {nativeAsset.symbol}
    </Text>
  )
}
