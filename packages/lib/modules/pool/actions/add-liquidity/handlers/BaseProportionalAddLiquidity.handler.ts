import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import {
  AddLiquidity,
  AddLiquidityKind,
  AddLiquidityProportionalInput,
  Address,
  HumanAmount,
  InputAmount,
  Slippage,
} from '@balancer/sdk'
import { Pool } from '../../../pool.types'
import { getSender, LiquidityActionHelpers } from '../../LiquidityActionHelpers'
import { SdkBuildAddLiquidityInput, SdkQueryAddLiquidityOutput } from '../add-liquidity.types'
import { AddLiquidityHandler } from './AddLiquidity.handler'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { getRpcUrl } from '@repo/lib/modules/web3/transports'

/**
 * Base abstract class that shares common logic shared by v3 and v2/v1 pool proportional add handlers
 */
export abstract class BaseProportionalAddLiquidityHandler implements AddLiquidityHandler {
  protected helpers: LiquidityActionHelpers

  constructor(pool: Pool) {
    this.helpers = new LiquidityActionHelpers(pool)
  }

  public async getPriceImpact(): Promise<number> {
    return 0 // Proportional joins don't have price impact
  }

  public async simulate(
    humanAmountsIn: HumanTokenAmountWithAddress[],
    userAddress: Address
  ): Promise<SdkQueryAddLiquidityOutput> {
    const referenceAmount = this.helpers.toSdkInputAmounts(humanAmountsIn)[0]

    const addLiquidity = new AddLiquidity()

    const addLiquidityInput = this.constructSdkInput(referenceAmount, userAddress)
    const sdkQueryOutput = await addLiquidity.query(addLiquidityInput, this.helpers.poolState)

    return { bptOut: sdkQueryOutput.bptOut, to: sdkQueryOutput.to, sdkQueryOutput }
  }

  public async buildCallData({
    account,
    queryOutput,
    humanAmountsIn,
    slippagePercent,
  }: SdkBuildAddLiquidityInput): Promise<TransactionConfig> {
    const addLiquidity = new AddLiquidity()

    const { callData, to, value } = addLiquidity.buildCall({
      ...queryOutput.sdkQueryOutput,
      slippage: Slippage.fromPercentage(slippagePercent as HumanAmount),
      sender: account,
      recipient: account,
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
    referenceAmount: InputAmount,
    userAddress: Address
  ): AddLiquidityProportionalInput {
    return {
      chainId: this.helpers.chainId,
      rpcUrl: getRpcUrl(this.helpers.chainId),
      referenceAmount,
      kind: AddLiquidityKind.Proportional,
      sender: getSender(userAddress),
    }
  }
}
