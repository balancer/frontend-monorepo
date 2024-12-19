import {
  getNativeAssetAddress,
  getNetworkConfig,
  getWrappedNativeAssetAddress,
} from '@repo/lib/config/app.config'
import { SupportedChainId } from '@repo/lib/config/config.types'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { includesAddress, isSameAddress } from '@repo/lib/shared/utils/addresses'
import { Address } from 'viem'
import { HumanTokenAmountWithAddress, TokenBase } from './token.types'
import { InputAmount } from '@balancer/sdk'
import { Pool } from '../pool/PoolProvider'
import { getVaultConfig, isCowAmmPool, isV3Pool } from '../pool/pool.helpers'
import { ApiToken } from '../pool/pool.types'

export function isNativeAsset(token: TokenBase | string, chain: GqlChain | SupportedChainId) {
  return nativeAssetFilter(chain)(token)
}

export function isWrappedNativeAsset(
  token: TokenBase | string,
  chain: GqlChain | SupportedChainId
) {
  return wrappedNativeAssetFilter(chain)(token)
}

export function isNativeOrWrappedNative(
  token: TokenBase | string,
  chain: GqlChain | SupportedChainId
) {
  return isWrappedNativeAsset(token, chain) || isNativeAsset(token, chain)
}

export function nativeAssetFilter(chain: GqlChain | SupportedChainId) {
  return (token: TokenBase | string) => {
    const nativeAssetAddress = getNativeAssetAddress(chain)
    if (typeof token === 'string') {
      return isSameAddress(token, nativeAssetAddress)
    }
    return isSameAddress(token.address, nativeAssetAddress)
  }
}

export function wrappedNativeAssetFilter(chain: GqlChain | SupportedChainId) {
  return (token: TokenBase | string) => {
    const wNativeAssetAddress = getWrappedNativeAssetAddress(chain)
    if (typeof token === 'string') {
      return isSameAddress(token, wNativeAssetAddress)
    }
    return isSameAddress(token.address, wNativeAssetAddress)
  }
}

export function exclNativeAssetFilter(chain: GqlChain | SupportedChainId) {
  return (token: TokenBase | string) => {
    const nativeAssetAddress = getNativeAssetAddress(chain)
    if (typeof token === 'string') {
      return !isSameAddress(token, nativeAssetAddress)
    }
    return !isSameAddress(token.address, nativeAssetAddress)
  }
}

export function exclWrappedNativeAssetFilter(chain: GqlChain | SupportedChainId) {
  return (token: TokenBase | string) => {
    const wNativeAssetAddress = getWrappedNativeAssetAddress(chain)
    if (typeof token === 'string') {
      return !isSameAddress(token, wNativeAssetAddress)
    }
    return !isSameAddress(token.address, wNativeAssetAddress)
  }
}

/*
  If the given array contains the native asset, it is replaced with the wrapped native asset
*/
export function swapNativeWithWrapped(inputAmounts: InputAmount[], chain: GqlChain) {
  return inputAmounts.map(inputAmount => {
    if (isNativeAsset(inputAmount.address, chain)) {
      return {
        ...inputAmount,
        address: getWrappedNativeAssetAddress(chain),
      }
    }
    return inputAmount
  })
}

/*
  If the given array contains the wrapped native asset, it is replaced with the native asset
*/
export function swapWrappedWithNative(
  inputAmounts: HumanTokenAmountWithAddress[],
  chain: GqlChain
) {
  return inputAmounts.map(inputAmount => {
    if (isWrappedNativeAsset(inputAmount.tokenAddress, chain)) {
      return {
        ...inputAmount,
        tokenAddress: getNativeAssetAddress(chain),
      } as HumanTokenAmountWithAddress
    }
    return inputAmount
  })
}

export function requiresDoubleApproval(
  chainId: GqlChain | SupportedChainId,
  tokenAddress: Address
) {
  return includesAddress(
    getNetworkConfig(chainId).tokens.doubleApprovalRequired || [],
    tokenAddress
  )
}

export type PoolToken = Pool['poolTokens'][0]
export function getLeafTokens(poolTokens: PoolToken[]) {
  const leafTokens: ApiToken[] = []

  poolTokens.forEach(poolToken => {
    if (poolToken.nestedPool) {
      const nestedTokens = poolToken.nestedPool.tokens.filter(
        // Exclude the pool token itself
        t => !isSameAddress(t.address, poolToken.address)
      ) as PoolToken[]

      const nestedLeafTokens = nestedTokens.map(t => getTokenOrUnderlying(t))
      leafTokens.push(...nestedLeafTokens)
    } else {
      // TODO: add unit test for this case: pol id 0x42de4fa875126fdbaf590b2fc3802adbca58acee
      leafTokens.push(getTokenOrUnderlying(poolToken))
    }
  })

  return leafTokens
}

function getTokenOrUnderlying(token: PoolToken): ApiToken {
  // TODO: Do we need to check for isBufferedToken here?
  return token.isErc4626 && token.underlyingToken ? token.underlyingToken : buildApiToken(token)
}

export function getSpenderForAddLiquidity(pool: Pool): Address {
  if (isCowAmmPool(pool.type)) return pool.address as Address
  if (isV3Pool(pool)) {
    const permit2Address = getNetworkConfig(pool.chain).contracts.permit2
    if (!permit2Address) {
      throw new Error(`Permit2 feature is not yet available for this chain (${pool.chain}) `)
    }
    return permit2Address
  }
  const { vaultAddress } = getVaultConfig(pool)
  return vaultAddress
}

function buildApiToken(poolToken: PoolToken) {
  return {
    ...poolToken,
    // The following fields are (wrongly) optional in the generated PoolToken schema so we have to cast them to satisfy TS
    address: poolToken.address as Address,
    chainId: poolToken.chainId as number,
    chain: poolToken.chain as GqlChain,
    priority: poolToken.priority as number,
    tradable: poolToken.tradable as boolean,
  }
}
