import { getChainId, getNativeAsset, getNetworkConfig } from '@/lib/config/app.config'
import { TokenAmountToApprove } from '@/lib/modules/tokens/approvals/approval-rules'
import { nullAddress } from '@/lib/modules/web3/contracts/wagmi-helpers'
import { GqlChain, GqlPoolType, GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { isSameAddress } from '@/lib/shared/utils/addresses'
import { SentryError } from '@/lib/shared/utils/errors'
import { bn, isZero } from '@/lib/shared/utils/numbers'
import {
  HumanAmount,
  InputAmount,
  MinimalToken,
  NestedPoolState,
  PoolState,
  TokenAmount,
  mapPoolToNestedPoolState,
  mapPoolType,
  PoolStateWithBalances,
  Token,
} from '@balancer/sdk'
import { Hex, formatUnits, parseUnits, Address } from 'viem'
import {
  isAffectedByCspIssue,
  isComposableStableV1,
  isCowAmmPool,
  isGyro,
  isV3Pool,
} from '../pool.helpers'
import { Pool } from '../PoolProvider'
import {
  isNativeAsset,
  isNativeOrWrappedNative,
  isWrappedNativeAsset,
  swapNativeWithWrapped,
} from '../../tokens/token.helpers'
import { HumanTokenAmountWithAddress } from '../../tokens/token.types'
import BigNumber from 'bignumber.js'

// Null object used to avoid conditional checks during hook loading state
const NullPool: Pool = {
  id: nullAddress,
  address: nullAddress,
  type: 'Null',
  tokens: [],
} as unknown as Pool

/*
  This class provides helper methods to traverse the pool state and prepare data structures needed by add/remove liquidity handlers
  to implement the Add/RemoveLiquidityHandler interface
*/
export class LiquidityActionHelpers {
  constructor(public pool: Pool = NullPool) {}

  /* Used by default (non-nested) SDK handlers */
  public get poolState(): PoolState {
    return toPoolState(this.pool)
  }

  /* Used by default nested SDK handlers */
  public get nestedPoolState(): NestedPoolState {
    // TODO: PoolGetPool should be exposed by the SDK
    type PoolGetPool = Parameters<typeof mapPoolToNestedPoolState>[0]
    return mapPoolToNestedPoolState(this.pool as PoolGetPool)
  }

  public get poolStateWithBalances(): PoolStateWithBalances {
    return toPoolStateWithBalances(this.pool)
  }

  public get networkConfig() {
    return getNetworkConfig(this.pool.chain)
  }

  public get chainId() {
    return getChainId(this.pool.chain)
  }

  public getAmountsToApprove(
    humanAmountsIn: HumanTokenAmountWithAddress[]
  ): TokenAmountToApprove[] {
    return this.toInputAmounts(humanAmountsIn).map(({ address, rawAmount }) => {
      return {
        tokenAddress: address,
        requiredRawAmount: rawAmount,
        requestedRawAmount: rawAmount, //This amount will be probably replaced by MAX_BIGINT depending on the approval rules
      }
    })
  }

  public toInputAmounts(humanAmountsIn: HumanTokenAmountWithAddress[]): InputAmount[] {
    if (!humanAmountsIn.length) return []

    return humanAmountsIn
      .filter(({ humanAmount }) => bn(humanAmount).gt(0))
      .map(({ tokenAddress, humanAmount }) => {
        const chain = this.pool.chain
        if (isNativeAsset(tokenAddress, chain)) {
          const decimals = getNativeAsset(chain).decimals
          return {
            address: tokenAddress as Address,
            rawAmount: parseUnits(humanAmount, decimals),
            decimals,
          }
        }
        const token = this.pool.allTokens.find(token => isSameAddress(token.address, tokenAddress))
        if (!token) {
          throw new Error(
            `Provided token address ${tokenAddress} not found in pool tokens [${Object.keys(
              this.pool.allTokens.map(t => t.address)
            ).join(' , \n')}]`
          )
        }
        return {
          address: token.address as Address,
          rawAmount: parseUnits(humanAmount, token.decimals),
          decimals: token.decimals,
        }
      })
  }

  public isV3Pool(): boolean {
    return isV3Pool(this.pool)
  }

  /*
   1. Converts humanAmountsIn into SDK InputAmounts
   2. When the input includes it, it swaps the native asset with the wrapped native asset
  */
  public toSdkInputAmounts(humanAmountsIn: HumanTokenAmountWithAddress[]): InputAmount[] {
    return swapNativeWithWrapped(this.toInputAmounts(humanAmountsIn), this.pool.chain)
  }

  public isNativeAssetIn(humanAmountsIn: HumanTokenAmountWithAddress[]): boolean {
    const nativeAssetAddress = this.networkConfig.tokens.nativeAsset.address

    return humanAmountsIn.some(amountIn => isSameAddress(amountIn.tokenAddress, nativeAssetAddress))
  }

  public isNativeAsset(tokenAddress: Address): boolean {
    const nativeAssetAddress = this.networkConfig.tokens.nativeAsset.address

    return isSameAddress(tokenAddress, nativeAssetAddress)
  }
}

export const isEmptyAmount = (amountIn: HumanTokenAmountWithAddress) =>
  isEmptyHumanAmount(amountIn.humanAmount)

export const isEmptyHumanAmount = (humanAmount: HumanAmount | '') =>
  !humanAmount || bn(humanAmount).eq(0)

export const areEmptyAmounts = (humanAmountsIn: HumanTokenAmountWithAddress[]) =>
  !humanAmountsIn || humanAmountsIn.length === 0 || humanAmountsIn.every(isEmptyAmount)

export function toHumanAmount(tokenAmount: TokenAmount): HumanAmount {
  return formatUnits(tokenAmount.amount, tokenAmount.token.decimals) as HumanAmount
}

export function ensureLastQueryResponse<Q>(
  liquidityActionDescription: string,
  queryResponse?: Q
): Q {
  if (!queryResponse) {
    // This should never happen but this is a check against potential regression bugs
    console.error(`Missing queryResponse in ${liquidityActionDescription}`)
    throw new SentryError(
      `Missing queryResponse.
It looks that you tried to call useBuildCallData before the last query finished generating queryResponse`
    )
  }

  return queryResponse
}

export function supportsNestedActions(pool: Pool): boolean {
  const allowNestedActions = getNetworkConfig(pool.chain).pools?.allowNestedActions ?? []
  if (allowNestedActions.includes(pool.id)) return true
  return false
}

export function shouldUseRecoveryRemoveLiquidity(pool: Pool): boolean {
  // DEBUG: Uncomment following if condition to allow testing pools in recovery mode (but note paused). Examples:
  // pools/ethereum/v2/0x0da692ac0611397027c91e559cfd482c4197e4030002000000000000000005c9 (WEIGHTED)
  // pools/ethereum/v2/0x156c02f3f7fef64a3a9d80ccf7085f23cce91d76000000000000000000000570 (COMPOSABLE_STABLE)
  // if (pool.dynamicData.isInRecoveryMode) return true

  // All composableStables V1 are in recovery mode and they should use recovery exit even if they are not paused
  if (isComposableStableV1(pool)) return true

  if (pool.dynamicData.isInRecoveryMode && pool.dynamicData.isPaused) return true

  if (pool.dynamicData.isInRecoveryMode && isAffectedByCspIssue(pool)) return true

  return false
}

export function requiresProportionalInput(poolType: GqlPoolType): boolean {
  return isGyro(poolType) || isCowAmmPool(poolType)
}

type ProtocolVersion = PoolState['protocolVersion']

export function toPoolState(pool: Pool): PoolState {
  return {
    id: pool.id as Hex,
    address: pool.address as Address,
    // Destruct to avoid errors when the SDK tries to mutate the poolTokens (read-only from GraphQL)
    tokens: [...pool.poolTokens] as MinimalToken[],
    type: mapPoolType(pool.type),
    protocolVersion: pool.protocolVersion as ProtocolVersion,
  }
}

export function toPoolStateWithBalances(pool: Pool): PoolStateWithBalances {
  return {
    id: pool.id as Hex,
    address: pool.address as Address,
    type: mapPoolType(pool.type),
    tokens: pool.poolTokens.map(t => ({
      index: t.index,
      address: t.address as Address,
      balance: t.balance as HumanAmount,
      decimals: t.decimals,
    })),
    totalShares: pool.dynamicData.totalShares as HumanAmount,
    protocolVersion: pool.protocolVersion as ProtocolVersion,
  }
}

/**
 * Filters the human amounts based on whether the token to filter:
 * - is already in the array and
 * - is native and the wrapped native token is already in the array and
 * - is wrapped native and the native token is already in the array
 *
 * @param {HumanAmoHumanTokenAmountWithAddressuntIn[]} humanAmountsIn - The array of human amounts to filter.
 * @param {Address} tokenAddress - The token address to compare against.
 * @param {GqlChain} chain - The chain type for comparison.
 * @return {HumanTokenAmountWithAddress[]} The filtered array of human amounts.
 */
export function filterHumanAmountsIn(
  humanAmountsIn: HumanTokenAmountWithAddress[],
  tokenAddress: Address,
  chain: GqlChain
) {
  return humanAmountsIn.filter(
    amountIn =>
      !isSameAddress(amountIn.tokenAddress, tokenAddress) &&
      !(isNativeAsset(tokenAddress, chain) && isWrappedNativeAsset(amountIn.tokenAddress, chain)) &&
      !(isNativeAsset(amountIn.tokenAddress, chain) && isWrappedNativeAsset(tokenAddress, chain))
  )
}

/**
 * Used to avoid problems with proportional SDK priceImpact queries
 * Rounds down to avoid balance overflow issues
 */
export function roundDecimals(humanAmountsIn: HumanTokenAmountWithAddress[], maxDecimals = 10) {
  return humanAmountsIn.map(({ humanAmount, tokenAddress }) => ({
    humanAmount: bn(humanAmount).toFixed(maxDecimals, BigNumber.ROUND_DOWN) as HumanAmount,
    tokenAddress,
  }))
}

export function emptyTokenAmounts(pool: Pool): TokenAmount[] {
  return pool.poolTokens.map(token => TokenAmount.fromHumanAmount(token as unknown as Token, '0'))
}

export function shouldShowNativeWrappedSelector(token: GqlToken, poolType: GqlPoolType) {
  return (
    !isCowAmmPool(poolType) && // Cow AMM pools don't support wethIsEth
    isNativeOrWrappedNative(token.address as Address, token.chain)
  )
}

export function replaceWrappedWithNativeAsset(
  validTokens: GqlToken[],
  nativeAsset: GqlToken | undefined
) {
  if (!nativeAsset) return validTokens
  return validTokens.map(token => {
    if (isWrappedNativeAsset(token.address as Address, nativeAsset.chain)) {
      return nativeAsset
    } else {
      return token
    }
  })
}

export function injectNativeAsset(
  validTokens: GqlToken[],
  nativeAsset: GqlToken | undefined,
  pool: Pool
) {
  const isWrappedNativeAssetInPool = validTokens.find(token =>
    isWrappedNativeAsset(token.address as Address, pool.chain)
  )

  if (
    isWrappedNativeAssetInPool &&
    nativeAsset &&
    // Cow AMM pools don't support wethIsEth
    !isCowAmmPool(pool.type)
  ) {
    return [nativeAsset, ...validTokens]
  }
  return validTokens
}

export function hasNoLiquidity(pool: Pool): boolean {
  return isZero(pool.dynamicData.totalShares)
}
