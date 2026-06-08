import {
  AddLiquidityUnbalancedViaSwapBuildCallInput,
  AddLiquidityUnbalancedViaSwapQueryOutput,
  AddLiquidityUnbalancedViaSwapV3,
  Slippage,
} from '@balancer/sdk'
import { getRpcUrl } from '@repo/lib/modules/web3/transports'
import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { BuildAddLiquidityInput, QueryAddLiquidityOutput } from '../add-liquidity.types'
import { AddLiquidityHandler } from './AddLiquidity.handler'
import { Pool } from '../../../pool.types'
import { LiquidityActionHelpers, getSender } from '../../LiquidityActionHelpers'
import { Address } from 'viem'
import { isZero } from '@repo/lib/shared/utils/numbers'

export class UnbalancedAddLiquidityViaSwapV3Handler implements AddLiquidityHandler {
  protected helpers: LiquidityActionHelpers
  private lastQueryOutput?: AddLiquidityUnbalancedViaSwapQueryOutput

  constructor(pool: Pool) {
    this.helpers = new LiquidityActionHelpers(pool)
  }

  public async simulate(
    humanAmountsIn: HumanTokenAmountWithSymbol[],
    userAddress: Address
  ): Promise<QueryAddLiquidityOutput> {
    const addLiquidity = new AddLiquidityUnbalancedViaSwapV3()

    const expectedAdjustableAmountIn = this.getExpectedAdjustableAmountIn(humanAmountsIn)

    const sdkQueryOutput = await addLiquidity.query(
      {
        chainId: this.helpers.chainId,
        rpcUrl: getRpcUrl(this.helpers.chainId),
        expectedAdjustableAmountIn,
        sender: getSender(userAddress),
      },
      this.helpers.poolState
    )

    this.lastQueryOutput = sdkQueryOutput

    return {
      bptOut: sdkQueryOutput.bptOut,
      to: sdkQueryOutput.to,
    }
  }

  // TODO: check this
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getPriceImpact(_humanAmountsIn: HumanTokenAmountWithSymbol[]): Promise<number> {
    // PriceImpact.addLiquidityUnbalancedViaSwap is not yet available in the SDK
    // Returning 0 to allow the flow to continue; UI should handle this gracefully
    return 0
  }

  public async buildCallData({
    humanAmountsIn,
    slippagePercent,
    queryOutput,
    account,
    permit2,
  }: BuildAddLiquidityInput): Promise<TransactionConfig> {
    // queryOutput is passed by interface contract but we use the instance-stored output
    void queryOutput

    const addLiquidity = new AddLiquidityUnbalancedViaSwapV3()

    if (!this.lastQueryOutput) {
      throw new Error('Missing query output. Please simulate before building call data.')
    }

    const sdkQueryOutput = this.lastQueryOutput

    const buildCallParams: AddLiquidityUnbalancedViaSwapBuildCallInput = {
      ...sdkQueryOutput,
      slippage: Slippage.fromPercentage(`${Number(slippagePercent)}`),
      wethIsEth: this.helpers.isNativeAssetIn(humanAmountsIn),
      deadline: BigInt(Number.MAX_SAFE_INTEGER),
    }

    const { callData, to, value } = permit2
      ? addLiquidity.buildCallWithPermit2(buildCallParams, permit2)
      : addLiquidity.buildCall(buildCallParams)

    return {
      account,
      chainId: this.helpers.chainId,
      data: callData,
      to,
      value,
    }
  }

  private getExpectedAdjustableAmountIn(
    humanAmountsIn: HumanTokenAmountWithSymbol[]
  ): ReturnType<LiquidityActionHelpers['toSdkInputAmounts']>[number] {
    const nonZeroAmounts = humanAmountsIn.filter(
      amount => amount.humanAmount && !isZero(amount.humanAmount)
    )

    if (nonZeroAmounts.length === 0) {
      throw new Error('No token amount provided for unbalanced add liquidity via swap')
    }

    if (nonZeroAmounts.length > 1) {
      throw new Error(
        'Unbalanced add liquidity via swap only supports single-sided input. Please provide an amount for only one token.'
      )
    }

    const inputAmounts = this.helpers.toSdkInputAmounts(nonZeroAmounts)
    return inputAmounts[0]
  }
}
