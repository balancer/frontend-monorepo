'use client'

import { PlusSquareIcon } from '@chakra-ui/icons'
import { IconButton, IconButtonProps, Tooltip } from '@chakra-ui/react'
import { useWalletClient } from 'wagmi'
import { useTokens } from './TokensProvider'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'

export function AddTokenToWalletButton({
  tokenAddress,
  chain,
  ...rest
}: { tokenAddress: string; chain: GqlChain } & Omit<IconButtonProps, 'aria-label'>) {
  const { data: walletClient } = useWalletClient()
  const { getToken } = useTokens()

  const token = getToken(tokenAddress, chain)
  const label = 'Add token to wallet'

  async function addToWallet() {
    if (!token) {
      return
    }
    await walletClient?.watchAsset({
      type: 'ERC20',
      options: {
        address: token.address,
        decimals: token.decimals,
        symbol: token.symbol,
        ...(token.logoURI && { image: token.logoURI }),
      },
    })
  }

  return (
    <Tooltip label={label}>
      <IconButton
        size="xs"
        isRound
        w="6"
        h="6"
        variant="ghost"
        aria-label={label}
        icon={<PlusSquareIcon />}
        onClick={addToWallet}
        {...rest}
      />
    </Tooltip>
  )
}
