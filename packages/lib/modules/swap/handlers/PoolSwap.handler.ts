import { Path, TokenApi } from '@balancer/sdk'
import { GqlSorSwapType, GqlToken } from '@repo/lib/shared/services/api/generated/graphql'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { Address, parseUnits } from 'viem'
import { Pool } from '../../pool/PoolProvider'
import { supportsNestedActions } from '../../pool/actions/LiquidityActionHelpers'
import { getNestedBptParentToken, isStandardRootToken } from '../../pool/pool.helpers'
import { ProtocolVersion } from '../../pool/pool.types'
import { SdkSimulateSwapResponse, SimulateSwapInputs } from '../swap.types'
import { BaseDefaultSwapHandler } from './BaseDefaultSwap.handler'

export class PoolSwapHandler extends BaseDefaultSwapHandler {
  name = 'PoolSwapHandler'

  constructor(
    public pool: Pool,
    public poolActionableTokens: GqlToken[]
  ) {
    super()
  }

  async simulate({ ...variables }: SimulateSwapInputs): Promise<SdkSimulateSwapResponse> {
    const { swapType, swapAmount } = variables

    const tokenIn = this.poolActionableTokens.find(token => {
      return isSameAddress(token.address, variables.tokenIn)
    }) as TokenApi

    if (!tokenIn) {
      throw new Error('TokenIn not found in pool swap handler')
    }

    const tokenOut = this.poolActionableTokens.find(token =>
      isSameAddress(token.address, variables.tokenOut)
    ) as TokenApi

    if (!tokenOut) {
      throw new Error('TokenOut not found in pool swap handler')
    }

    const inputAmountRaw: bigint =
      swapType === GqlSorSwapType.ExactIn ? parseUnits(swapAmount, tokenIn.decimals) : 0n
    const outputAmountRaw: bigint =
      swapType === GqlSorSwapType.ExactOut ? parseUnits(swapAmount, tokenOut.decimals) : 0n

    const path = buildPoolSwapPath({
      inputAmountRaw,
      outputAmountRaw,
      pool: this.pool,
      tokenIn,
      tokenOut,
    })

    return super.runSimulation({
      paths: [path],
      hopCount: path.pools.length,
      swapInputs: variables,
      protocolVersion: this.pool.protocolVersion as ProtocolVersion,
    })
  }
}

type PathParams = {
  pool: Pool
  inputAmountRaw: bigint
  outputAmountRaw: bigint
  tokenIn: TokenApi
  tokenOut: TokenApi
}

export function buildPoolSwapPath(params: PathParams): Path {
  const { inputAmountRaw, outputAmountRaw, pool, tokenIn, tokenOut } = params

  if (supportsNestedActions(pool)) return buildPathsForNestedPoolSwap(params)

  return {
    pools: [pool.id as Address],
    inputAmountRaw,
    outputAmountRaw,
    protocolVersion: pool.protocolVersion as ProtocolVersion,
    tokens: [tokenIn, tokenOut],
  }
}

function buildPathsForNestedPoolSwap({
  pool,
  tokenIn,
  tokenOut,
  inputAmountRaw,
  outputAmountRaw,
}: PathParams): Path {
  // If the tokenIn is a root non-nested token, then the tokenOut is a nested token
  if (isStandardRootToken(pool, tokenIn.address as Address)) {
    const bptNestedToken = getNestedBptParentToken(pool.poolTokens, tokenOut.address as Address)

    const path: Path = {
      pools: [pool.id as Address, bptNestedToken.nestedPool?.id as Address],
      inputAmountRaw,
      outputAmountRaw,
      protocolVersion: pool.protocolVersion as ProtocolVersion,
      tokens: [tokenIn as TokenApi, bptNestedToken as TokenApi, tokenOut as TokenApi],
    }

    return path
  }

  // If the tokenIn is a nested token, then the tokenOut is a root non-nested token
  const bptNestedToken = getNestedBptParentToken(pool.poolTokens, tokenIn.address as Address)

  const path: Path = {
    pools: [bptNestedToken.nestedPool?.id as Address, pool.id as Address],
    inputAmountRaw,
    outputAmountRaw,
    protocolVersion: pool.protocolVersion as ProtocolVersion,
    tokens: [tokenIn as TokenApi, bptNestedToken as TokenApi, tokenOut as TokenApi],
  }

  return path
}
