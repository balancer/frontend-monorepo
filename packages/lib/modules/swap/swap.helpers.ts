import { Address } from 'viem'
import { OSwapAction, SdkSimulateSwapResponse, SwapAction } from './swap.types'
import { GqlChain, GqlSorSwapType } from '@repo/lib/shared/services/api/generated/graphql'
import {
  getNativeAssetAddress,
  getNetworkConfig,
  getWrappedNativeAssetAddress,
} from '@repo/lib/config/app.config'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { isMainnet } from '../chains/chain.utils'
import { SwapSimulationQueryResult } from './queries/useSimulateSwapQuery'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

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
    message: `There's not enough liquidity on ${PROJECT_CONFIG.projectName} connecting these tokens to route this swap.`,
  },
  {
    pattern: /WrapAmountTooSmall/,
    message: 'Your input is too small, please try a bigger amount.',
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

export function isV3SwapRoute(simulationQuery: SwapSimulationQueryResult): boolean {
  return orderRouteVersion(simulationQuery) === 3
}

export function orderRouteVersion(simulationQuery: SwapSimulationQueryResult): number {
  const queryData = simulationQuery.data as SdkSimulateSwapResponse
  const orderRouteVersion = queryData ? queryData.protocolVersion : 2
  return orderRouteVersion
}
