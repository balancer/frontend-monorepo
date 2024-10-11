import { SdkQueryAddLiquidityOutput } from '@/lib/modules/pool/actions/add-liquidity/add-liquidity.types'
import { getNowTimestampInSecs } from '@/lib/shared/utils/time'
import { AllowedAmountsByTokenAddress, ExpirationByTokenAddress } from './usePermit2Allowance'
import { Address } from 'viem'
import { TokenAmount } from '@balancer/sdk'
import { getGqlChain } from '@/lib/config/app.config'
import { filterWrappedNativeAsset } from '../../token.helpers'
import { GetTokenFn } from '../../TokensProvider'

export function hasValidPermit2(
  queryOutput?: SdkQueryAddLiquidityOutput,
  expirations?: ExpirationByTokenAddress,
  allowedAmounts?: AllowedAmountsByTokenAddress
): boolean {
  if (!expirations || !allowedAmounts) return false

  const approvalExpired = (tokenAddress: Address) =>
    expirations[tokenAddress] >= getNowTimestampInSecs()
  const alreadyAllowed = (amountIn: TokenAmount) =>
    !approvalExpired(amountIn.token.address) &&
    allowedAmounts[amountIn.token.address] >= amountIn.amount
  const amountInValid = (amountIn: TokenAmount) =>
    amountIn.amount === 0n || alreadyAllowed(amountIn)
  const isValid = !!queryOutput?.sdkQueryOutput.amountsIn.every(amountInValid)
  return isValid
}

type BasePermit2Params = {
  queryOutput?: SdkQueryAddLiquidityOutput
  wethIsEth: boolean
}

// Returns the symbols of the tokens that need to be approved for permit2
export function getTokenSymbolsForPermit2({
  getToken,
  queryOutput,
  wethIsEth,
}: BasePermit2Params & { getToken: GetTokenFn }) {
  if (!queryOutput) return []
  const chain = getGqlChain(queryOutput.sdkQueryOutput.chainId)
  const tokenSymbols = filterWrappedNativeAsset({
    wethIsEth,
    amountsIn: queryOutput.sdkQueryOutput.amountsIn,
    chain,
  })
    .filter(a => a.amount > 0n)
    .map(a => getToken(a.token.address, chain)?.symbol ?? 'Unknown')
  return tokenSymbols
}

// Returns the token addresses that need to be approved for permit2
export function getTokenAddressesForPermit2({
  wethIsEth,
  queryOutput,
}: BasePermit2Params): Address[] | undefined {
  if (!queryOutput?.sdkQueryOutput) return undefined
  const chain = getGqlChain(queryOutput.sdkQueryOutput.chainId)
  const result = filterWrappedNativeAsset({
    wethIsEth,
    chain,
    amountsIn: queryOutput.sdkQueryOutput.amountsIn,
  }).map(a => a.token.address)
  return result
}
