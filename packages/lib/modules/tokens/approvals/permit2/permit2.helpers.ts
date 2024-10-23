import { getGqlChain, getNetworkConfig } from '@repo/lib/config/app.config'
import { getNowTimestampInSecs } from '@repo/lib/shared/utils/time'
import { Address } from 'viem'
import { GetTokenFn } from '../../TokensProvider'
import { AllowedAmountsByTokenAddress, ExpirationByTokenAddress } from './usePermit2Allowance'
import { TokenAmountIn } from './useSignPermit2'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { isWrappedNativeAsset } from '../../token.helpers'

export function hasValidPermit2(
  tokenAmountsIn?: TokenAmountIn[],
  expirations?: ExpirationByTokenAddress,
  allowedAmounts?: AllowedAmountsByTokenAddress,
): boolean {
  if (!expirations || !allowedAmounts || !tokenAmountsIn) return false

  const approvalExpired = (tokenAddress: Address) =>
    expirations[tokenAddress] < getNowTimestampInSecs()
  const alreadyAllowed = (amountIn: TokenAmountIn) =>
    !approvalExpired(amountIn.address) &&
    allowedAmounts[amountIn.address] >= amountIn.amount
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
export function getTokenSymbolsForPermit({
  getToken,
  tokenAmountsIn,
  wethIsEth,
  chainId,
}: BasePermit2Params & { getToken: GetTokenFn }): string[] {
  if (!tokenAmountsIn) return []
  const chain = getGqlChain(chainId)
  const tokenSymbols = filterWrappedNativeAsset({
    wethIsEth,
    tokenAmountsIn,
    chain,
  })
    .filter(t => t.amount > 0n) // This must be filtered in a different place (caller??)
    .map(t => getToken(t.address, chain)?.symbol ?? 'Unknown')
  return tokenSymbols
}

// Returns the token addresses that need to be approved for permit2
export function getTokenAddressesForPermit({
  wethIsEth,
  tokenAmountsIn,
  chainId,
}: BasePermit2Params): Address[] | undefined {
  if (!tokenAmountsIn) return undefined
  const chain = getGqlChain(chainId)
  return filterWrappedNativeAsset({
    wethIsEth,
    chain,
    tokenAmountsIn,
  }).map(t => t.address)
}

export function permit2Address(chain: GqlChain): Address {
  return getNetworkConfig(chain).contracts.permit2 || ('' as Address)
}

function filterWrappedNativeAsset({
  tokenAmountsIn,
  wethIsEth,
  chain,
}: {
  tokenAmountsIn?: TokenAmountIn[],
  wethIsEth: boolean
  chain: GqlChain
}): TokenAmountIn[] {
  if (!tokenAmountsIn) return []
  if (!wethIsEth) return tokenAmountsIn
  return tokenAmountsIn.filter(t => !isWrappedNativeAsset(t.address, chain))
}

