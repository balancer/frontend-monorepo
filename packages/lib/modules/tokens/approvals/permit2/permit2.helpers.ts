import { getGqlChain, getNetworkConfig } from '@repo/lib/config/app.config'
import { getNowTimestampInSecs } from '@repo/lib/shared/utils/time'
import { Address } from 'viem'
import { GetTokenFn } from '../../TokensProvider'
import { AllowedAmountsByTokenAddress, ExpirationByTokenAddress } from './usePermit2Allowance'
import { TokenAmountIn } from './useSignPermit2'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { isNativeAsset, isWrappedNativeAsset } from '../../token.helpers'

export function hasValidPermit2(
  tokenAmountsIn?: TokenAmountIn[],
  expirations?: ExpirationByTokenAddress,
  allowedAmounts?: AllowedAmountsByTokenAddress
): boolean {
  if (!expirations || !allowedAmounts || !tokenAmountsIn) return false

  const approvalExpired = (tokenAddress: Address) =>
    expirations[tokenAddress] < getNowTimestampInSecs()
  const alreadyAllowed = (amountIn: TokenAmountIn) =>
    !approvalExpired(amountIn.address) && allowedAmounts[amountIn.address] >= amountIn.amount
  const amountInValid = (amountIn: TokenAmountIn) =>
    amountIn.amount === 0n || alreadyAllowed(amountIn)
  const isValid = tokenAmountsIn.every(amountInValid)
  /*
   // Delete after debug:
   if (tokenAmountsIn) {
     const tokenAddress = tokenAmountsIn[0].address
     const amountIn = tokenAmountsIn[0]
     console.log({tokenAddress,
       approvalExpired: approvalExpired(tokenAddress),
       alreadyAllowed: alreadyAllowed(amountIn),
     })
   }
  */
  return isValid
}

type BasePermit2Params = {
  tokenAmountsIn?: TokenAmountIn[]
  chainId: number
  wethIsEth: boolean
}

// Returns the symbols of the tokens that need to be approved for permit2
export function getTokenSymbolsForPermit2({
  getToken,
  tokenAmountsIn,
  wethIsEth,
  chainId,
}: BasePermit2Params & { getToken: GetTokenFn }): string[] {
  if (!tokenAmountsIn) return []

  const chain = getGqlChain(chainId)
  const tokenSymbols = filterTokensForPermit2({
    wethIsEth,
    tokenAmountsIn,
    chain,
  })
    .filter(t => t.amount > 0n)
    .map(t => {
      if (t.symbol) return t.symbol
      return getToken(t.address, chain)?.symbol ?? 'Unknown'
    })
  return tokenSymbols
}

// Returns the token addresses that need to be approved for permit2
export function getTokenAddressesForPermit2(tokenAmountsIn?: TokenAmountIn[]): Address[] {
  if (!tokenAmountsIn) return []
  return tokenAmountsIn.map(t => t.address)
}

export function permit2Address(chain: GqlChain): Address {
  // TODO: Remove ('' as Address) when all chains have permit2 defined to it's not optional anymore
  return getNetworkConfig(chain).contracts.permit2 || ('' as Address)
}

/*
  Returns the token amounts that need to be approved for permit2
  Excludes the native asset
  If wethIsEth, it excludes the wrapped native asset (as the user will use the native asset instead, which does not require approval)
*/
export function filterTokensForPermit2({
  tokenAmountsIn,
  wethIsEth,
  chain,
}: {
  tokenAmountsIn?: TokenAmountIn[]
  wethIsEth: boolean
  chain: GqlChain
}): TokenAmountIn[] {
  if (!tokenAmountsIn) return []
  return (
    tokenAmountsIn
      // native asset does not require permit2 approval
      .filter(t => !isNativeAsset(t.address, chain))
      // if wethIsEth the wrapped native asset token will be replaced with the native asset token so no required permit2 approval neither
      .filter(t => wethIsEth && !isWrappedNativeAsset(t.address, chain))
  )
}
