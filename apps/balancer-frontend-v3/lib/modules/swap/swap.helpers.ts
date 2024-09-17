import { Address } from 'viem'
import { OSwapAction, SwapAction } from './swap.types'
import { GqlChain, GqlSorSwapType } from '@/lib/shared/services/api/generated/graphql'
import {
  getNativeAssetAddress,
  getNetworkConfig,
  getWrappedNativeAssetAddress,
} from '@/lib/config/app.config'
import { isSameAddress } from '@/lib/shared/utils/addresses'
import { isMainnet } from '../chains/chain.utils'

export function swapActionPastTense(action: SwapAction): string {
  switch (action) {
    case OSwapAction.WRAP:
      return 'Wrapped'
    case OSwapAction.UNWRAP:
      return 'Unwrapped'
    case OSwapAction.SWAP:
      return 'Swapped'
    default:
      throw new Error('Unsupported swap action')
  }
}

const swapErrorPatterns = [
  {
    pattern: /must contain at least 1 path/,
    message: "There's not enough liquidity on Balancer connecting these tokens to route this swap.",
  },
]

export function parseSwapError(msg?: string): string {
  if (!msg) return 'Unknown error'
  const pattern = swapErrorPatterns.find(p => p.pattern.test(msg))
  return pattern ? pattern.message : msg
}

export function getAuraBalAddress(chainId: GqlChain) {
  return getNetworkConfig(chainId).tokens.addresses.auraBal
}

export function getBalAddress(chainId: GqlChain) {
  return getNetworkConfig(chainId).tokens.addresses.bal
}

export function isAuraBalSwap(
  tokenIn: Address,
  tokenOut: Address,
  chain: GqlChain,
  swapType: GqlSorSwapType
) {
  const auraBAL = getAuraBalAddress(chain)
  if (!auraBAL) return false

  const relevantTokens = [
    getNativeAssetAddress(chain),
    getWrappedNativeAssetAddress(chain),
    getBalAddress(chain),
  ]

  const tokenInOrOutIsAuraBal = isSameAddress(tokenIn, auraBAL) || isSameAddress(tokenOut, auraBAL)
  const tokenInOrOutIsRelevantToken = relevantTokens.some(
    token => isSameAddress(tokenIn, token) || isSameAddress(tokenOut, token)
  )
  const isExactInSwap = swapType === GqlSorSwapType.ExactIn

  return tokenInOrOutIsAuraBal && tokenInOrOutIsRelevantToken && isExactInSwap && isMainnet(chain)
}
