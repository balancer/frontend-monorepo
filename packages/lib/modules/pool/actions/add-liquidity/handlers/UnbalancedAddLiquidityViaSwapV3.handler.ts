import {
  AddLiquidityUnbalancedViaSwapBuildCallInput,
  AddLiquidityUnbalancedViaSwapQueryOutput,
  AddLiquidityUnbalancedViaSwapV3,
  PriceImpact,
  PriceImpactAmount,
  Slippage,
} from '@balancer/sdk'
import { getRpcUrl } from '@repo/lib/modules/web3/transports'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { SdkBuildAddLiquidityInput, SdkQueryAddLiquidityOutput } from '../add-liquidity.types'
import { AddLiquidityHandler } from './AddLiquidity.handler'
import { Pool } from '../../../pool.types'
import { LiquidityActionHelpers, areEmptyAmounts, getSender } from '../../LiquidityActionHelpers'
import { Address } from 'viem'
import { isZero } from '@repo/lib/shared/utils/numbers'

export class UnbalancedAddLiquidityViaSwapV3Handler implements AddLiquidityHandler {
  protected helpers: LiquidityActionHelpers

  constructor(pool: Pool) {
    this.helpers = new LiquidityActionHelpers(pool)
  }

  public async simulate(
    humanAmountsIn: HumanTokenAmountWithSymbol[],
    userAddress: Address
  ): Promise<SdkQueryAddLiquidityOutput> {
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

    return {
      bptOut: sdkQueryOutput.bptOut,
      to: sdkQueryOutput.to,
      sdkQueryOutput,
    }
  }

  public async getPriceImpact(humanAmountsIn: HumanTokenAmountWithSymbol[]): Promise<number> {
    if (areEmptyAmounts(humanAmountsIn)) {
      return 0
    }

    const expectedAdjustableAmountIn = this.getExpectedAdjustableAmountIn(humanAmountsIn)

    const priceImpactAmount: PriceImpactAmount = await PriceImpact.addLiquidityUnbalancedViaSwap(
      {
        chainId: this.helpers.chainId,
        rpcUrl: getRpcUrl(this.helpers.chainId),
        expectedAdjustableAmountIn,
      },
      this.helpers.poolState
    )

    return priceImpactAmount.decimal
  }

  public async buildCallData({
    humanAmountsIn,
    slippagePercent,
    queryOutput,
    account,
    permit2,
  }: SdkBuildAddLiquidityInput): Promise<TransactionConfig> {
    const addLiquidity = new AddLiquidityUnbalancedViaSwapV3()

    const sdkQueryOutput = queryOutput.sdkQueryOutput as AddLiquidityUnbalancedViaSwapQueryOutput

    const buildCallParams: AddLiquidityUnbalancedViaSwapBuildCallInput = {
      ...sdkQueryOutput,
      slippage: Slippage.fromPercentage(`${Number(slippagePercent)}`),
      wethIsEth: this.helpers.isNativeAssetIn(humanAmountsIn),
      deadline: BigInt(Number.MAX_SAFE_INTEGER),
    }

    const {
      callData,
      to: sdkTo,
      value,
    } = permit2
      ? addLiquidity.buildCallWithPermit2(buildCallParams, permit2)
      : addLiquidity.buildCall(buildCallParams)

    const networkConfig = getNetworkConfig(this.helpers.pool.chain)
    const unbalancedViaSwapRouter = networkConfig.contracts.balancer.unbalancedAddViaSwapRouter
    const to = (unbalancedViaSwapRouter || sdkTo) as Address

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
