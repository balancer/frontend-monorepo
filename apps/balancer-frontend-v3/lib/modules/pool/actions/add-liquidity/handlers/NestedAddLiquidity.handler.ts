import { TransactionConfig } from '@/lib/modules/web3/contracts/contract.types'
import {
  AddLiquidityNested,
  AddLiquidityNestedInput,
  ChainId,
  PriceImpact,
  Slippage,
} from '@balancer/sdk'
import { Pool } from '../../../PoolProvider'
import { LiquidityActionHelpers, areEmptyAmounts } from '../../LiquidityActionHelpers'
import { NestedBuildAddLiquidityInput, NestedQueryAddLiquidityOutput } from '../add-liquidity.types'
import { AddLiquidityHandler } from './AddLiquidity.handler'
import { HumanTokenAmountWithAddress } from '@/lib/modules/tokens/token.types'
import { getRpcUrl } from '@/lib/modules/web3/transports'

/**
 * NestedAddLiquidityHandler is a handler that implements the
 * AddLiquidityHandler interface for nested adds, e.g. where the user
 * specifies the token amounts in. It uses the Balancer SDK to implement it's
 * methods. It also handles the case where one of the input tokens is the native
 * asset instead of the wrapped native asset.
 */
export class NestedAddLiquidityHandler implements AddLiquidityHandler {
  helpers: LiquidityActionHelpers

  constructor(pool: Pool) {
    this.helpers = new LiquidityActionHelpers(pool)
  }

  public async getPriceImpact(humanAmountsIn: HumanTokenAmountWithAddress[]): Promise<number> {
    if (areEmptyAmounts(humanAmountsIn)) {
      // Avoid price impact calculation when there are no amounts in
      return 0
    }
    const input = this.constructSdkInput(humanAmountsIn)
    const priceImpactABA = await PriceImpact.addLiquidityNested(input, this.helpers.nestedPoolState)
    return priceImpactABA.decimal
  }

  public async simulate(
    humanAmountsIn: HumanTokenAmountWithAddress[]
  ): Promise<NestedQueryAddLiquidityOutput> {
    const addLiquidity = new AddLiquidityNested()

    const addLiquidityInput = this.constructSdkInput(humanAmountsIn)

    const sdkQueryOutput = await addLiquidity.query(addLiquidityInput, this.helpers.nestedPoolState)

    return { bptOut: sdkQueryOutput.bptOut, sdkQueryOutput }
  }

  public async buildCallData({
    account,
    slippagePercent,
    queryOutput,
    relayerApprovalSignature,
    humanAmountsIn,
  }: NestedBuildAddLiquidityInput): Promise<TransactionConfig> {
    const addLiquidity = new AddLiquidityNested()

    const { callData, to, value } = addLiquidity.buildCall({
      ...queryOutput.sdkQueryOutput,
      slippage: Slippage.fromPercentage(`${Number(slippagePercent)}`),
      accountAddress: account,
      relayerApprovalSignature,
      wethIsEth: this.helpers.isNativeAssetIn(humanAmountsIn),
    })

    return {
      account,
      chainId: this.helpers.chainId,
      data: callData,
      to,
      value,
    }
  }

  /**
   * PRIVATE METHODS
   */
  private constructSdkInput(
    humanAmountsIn: HumanTokenAmountWithAddress[]
  ): AddLiquidityNestedInput {
    const amountsIn = this.helpers.toSdkInputAmounts(humanAmountsIn)

    const nonEmptyAmountsIn = amountsIn.filter(a => a.rawAmount !== 0n)

    return {
      chainId: this.helpers.chainId as ChainId,
      rpcUrl: getRpcUrl(this.helpers.chainId),
      amountsIn: nonEmptyAmountsIn,
    }
  }
}
