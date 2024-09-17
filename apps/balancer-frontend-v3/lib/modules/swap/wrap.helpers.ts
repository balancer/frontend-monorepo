import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { Address } from 'viem'
import { isNativeAsset, isWrappedNativeAsset } from '../tokens/token.helpers'
import { getNetworkConfig } from '@/lib/config/app.config'
import { isSameAddress, sameAddresses } from '@/lib/shared/utils/addresses'
import { LidoWrapHandler } from './handlers/LidoWrap.handler'
import { SwapHandler } from './handlers/Swap.handler'
import { OWrapType, SupportedWrapHandler, WrapType } from './swap.types'

export function isNativeWrap(tokenIn: Address, tokenOut: Address, chain: GqlChain) {
  const tokenInIsNative = isNativeAsset(tokenIn, chain) || isWrappedNativeAsset(tokenIn, chain)
  const tokenOutIsNative = isNativeAsset(tokenOut, chain) || isWrappedNativeAsset(tokenOut, chain)

  return tokenInIsNative && tokenOutIsNative
}

export function isSupportedWrap(tokenIn: Address, tokenOut: Address, chain: GqlChain) {
  const networkConfig = getNetworkConfig(chain)
  const supportedWrappers = networkConfig.tokens.supportedWrappers || []
  return supportedWrappers.some(wrapper =>
    sameAddresses([wrapper.baseToken, wrapper.wrappedToken], [tokenIn, tokenOut])
  )
}

export function isWrapOrUnwrap(tokenIn: Address, tokenOut: Address, chain: GqlChain) {
  return isNativeWrap(tokenIn, tokenOut, chain) || isSupportedWrap(tokenIn, tokenOut, chain)
}

export function getWrapConfig(tokenIn: Address, tokenOut: Address, chain: GqlChain) {
  const networkConfig = getNetworkConfig(chain)
  const supportedWrappers = networkConfig.tokens.supportedWrappers || []
  if (!isSupportedWrap(tokenIn, tokenOut, chain)) throw new Error('Unsupported wrap')

  const wrapper = supportedWrappers.find(wrapper =>
    sameAddresses([wrapper.baseToken, wrapper.wrappedToken], [tokenIn, tokenOut])
  )

  if (!wrapper) throw new Error('Wrapper not found')

  return wrapper
}

export function getWrapHandlerClass(
  tokenIn: Address,
  tokenOut: Address,
  chain: GqlChain
): new () => SwapHandler {
  const wrapper = getWrapConfig(tokenIn, tokenOut, chain)

  switch (wrapper.swapHandler) {
    case SupportedWrapHandler.LIDO:
      return LidoWrapHandler
    default:
      throw new Error('Unsupported wrap handler')
  }
}

export function getWrapType(tokenIn: Address, tokenOut: Address, chain: GqlChain): WrapType | null {
  if (isNativeAsset(tokenIn, chain) && isWrappedNativeAsset(tokenOut, chain)) {
    return OWrapType.WRAP
  } else if (isWrappedNativeAsset(tokenIn, chain) && isNativeAsset(tokenOut, chain)) {
    return OWrapType.UNWRAP
  } else if (isSupportedWrap(tokenIn, tokenOut, chain)) {
    const wrapper = getWrapConfig(tokenIn, tokenOut, chain)
    return isSameAddress(wrapper.baseToken, tokenIn) ? OWrapType.WRAP : OWrapType.UNWRAP
  }

  return null
}

export function getWrapperForBaseToken(baseToken: Address, chain: GqlChain) {
  const networkConfig = getNetworkConfig(chain)
  const supportedWrappers = networkConfig.tokens.supportedWrappers || []
  return supportedWrappers.find(wrapper => isSameAddress(wrapper.baseToken, baseToken))
}
