import { getRpcUrl } from '@/lib/modules/web3/transports'
import { SentryError } from '@/lib/shared/utils/errors'
import {
  HumanAmount,
  InputAmount,
  PriceImpact,
  PriceImpactAmount,
  RemoveLiquidity,
  RemoveLiquidityKind,
  RemoveLiquiditySingleTokenExactInInput,
} from '@balancer/sdk'
import { Address, parseEther } from 'viem'
import { Pool } from '../../../PoolProvider'
import { BPT_DECIMALS } from '../../../pool.constants'
import { LiquidityActionHelpers, isEmptyHumanAmount } from '../../LiquidityActionHelpers'
import {
  BuildRemoveLiquidityInput,
  QueryRemoveLiquidityInput,
  SdkQueryRemoveLiquidityOutput,
} from '../remove-liquidity.types'
import { RemoveLiquidityHandler } from './RemoveLiquidity.handler'
import { TransactionConfig } from '@/lib/modules/web3/contracts/contract.types'

export abstract class BaseSingleTokenRemoveLiquidityHandler implements RemoveLiquidityHandler {
  protected helpers: LiquidityActionHelpers

  constructor(pool: Pool) {
    this.helpers = new LiquidityActionHelpers(pool)
  }

  public async simulate({
    humanBptIn,
    tokenOut,
  }: QueryRemoveLiquidityInput): Promise<SdkQueryRemoveLiquidityOutput> {
    const removeLiquidity = new RemoveLiquidity()
    const removeLiquidityInput = this.constructSdkInput(humanBptIn, tokenOut)

    const sdkQueryOutput = await removeLiquidity.query(removeLiquidityInput, this.helpers.poolState)

    return { amountsOut: sdkQueryOutput.amountsOut, sdkQueryOutput }
  }

  public async getPriceImpact({
    humanBptIn,
    tokenOut,
  }: QueryRemoveLiquidityInput): Promise<number> {
    if (!tokenOut) {
      throw new SentryError('TokenOut should never be undefined in Single Token remove liquidity')
    }

    if (isEmptyHumanAmount(humanBptIn) || !tokenOut) {
      // Avoid price impact calculation
      return 0
    }

    const removeLiquidityInput = this.constructSdkInput(humanBptIn, tokenOut)

    const priceImpactABA: PriceImpactAmount = await PriceImpact.removeLiquidity(
      removeLiquidityInput,
      this.helpers.poolState
    )

    return priceImpactABA.decimal
  }

  public abstract buildCallData(inputs: BuildRemoveLiquidityInput): Promise<TransactionConfig>

  /**
   * PRIVATE METHODS
   */
  private constructSdkInput(
    humanBptIn: HumanAmount,
    tokenOut: Address
  ): RemoveLiquiditySingleTokenExactInInput {
    const bptInInputAmount: InputAmount = {
      rawAmount: parseEther(humanBptIn),
      decimals: BPT_DECIMALS,
      address: this.helpers.pool.address as Address,
    }

    return {
      chainId: this.helpers.chainId,
      rpcUrl: getRpcUrl(this.helpers.chainId),
      bptIn: bptInInputAmount,
      kind: RemoveLiquidityKind.SingleTokenExactIn,
      tokenOut,
    }
  }
}
