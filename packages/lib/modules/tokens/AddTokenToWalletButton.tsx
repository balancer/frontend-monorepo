'use client'
import { IconButton, IconButtonProps } from '@chakra-ui/react'
import { Tooltip } from '../../shared/components/tooltips/Tooltip'
import { useWalletClient } from 'wagmi'
import { useTokens } from './TokensProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ensureError } from '@repo/lib/shared/utils/errors'
import { LuSquarePlus } from 'react-icons/lu'

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
    try {
      await walletClient?.watchAsset({
        type: 'ERC20',
        options: {
          address: token.address,
          decimals: token.decimals,
          symbol: token.symbol,
          ...(token.logoURI && { image: token.logoURI }),
        },
      })
    } catch (e) {
      const error = ensureError(e)
      /*
        There are edge cases where wallets like MetaMask do not support adding tokens with certain symbols.
        More details: https://ethereum.stackexchange.com/questions/161798/programatically-override-token-symbol-with-metamask-wallet-watchasset
      */
      if (error.name === 'InvalidParamsRpcError') {
        console.log('Your wallet does not support adding this token.', { error })
      }
    }
  }

  return (
    <Tooltip content={label}>
      <IconButton
        aria-label={label}
        h="6"
        onClick={addToWallet}
        rounded="full"
        size="xs"
        variant="ghost"
        w="6"
        {...rest}
      >
        <LuSquarePlus />
      </IconButton>
    </Tooltip>
  )
}
