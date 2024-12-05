/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { getRpcUrl } from '@repo/lib/modules/web3/transports'
import {
  AddLiquidity,
  AddLiquidityKind,
  AddLiquidityUnbalancedInput,
  Address,
  PriceImpact,
  PriceImpactAmount,
} from '@balancer/sdk'
import { Pool } from '../../../PoolProvider'
import { LiquidityActionHelpers, areEmptyAmounts, getSender } from '../../LiquidityActionHelpers'
import { SdkBuildAddLiquidityInput, SdkQueryAddLiquidityOutput } from '../add-liquidity.types'
import { AddLiquidityHandler } from './AddLiquidity.handler'

/**
 * Base abstract class that shares common logic shared by v3 and v2/v1 pool unbalanced handlers
 */
export abstract class BaseUnbalancedAddLiquidityHandler implements AddLiquidityHandler {
  protected helpers: LiquidityActionHelpers

  constructor(pool: Pool) {
    this.helpers = new LiquidityActionHelpers(pool)
  }

  public async simulate(
    humanAmountsIn: HumanTokenAmountWithAddress[],
    userAddress: Address
  ): Promise<SdkQueryAddLiquidityOutput> {
    const addLiquidity = new AddLiquidity()
    const addLiquidityInput = this.constructSdkInput(humanAmountsIn, userAddress)

    const sdkQueryOutput = await addLiquidity.query(addLiquidityInput, this.helpers.poolState)

    return { bptOut: sdkQueryOutput.bptOut, to: sdkQueryOutput.to, sdkQueryOutput }
  }

  public async getPriceImpact(humanAmountsIn: HumanTokenAmountWithAddress[]): Promise<number> {
    if (areEmptyAmounts(humanAmountsIn)) {
      // Avoid price impact calculation when there are no amounts in
      return 0
    }

    const addLiquidityInput = this.constructSdkInput(humanAmountsIn)

    const priceImpactABA: PriceImpactAmount = await PriceImpact.addLiquidityUnbalanced(
      addLiquidityInput,
      this.helpers.poolState
    )

    return priceImpactABA.decimal
  }

  public abstract buildCallData(input: SdkBuildAddLiquidityInput): Promise<TransactionConfig>

  /**
   * PRIVATE METHODS
   */
  protected constructSdkInput(
    humanAmountsIn: HumanTokenAmountWithAddress[],
    userAddress?: Address
  ): AddLiquidityUnbalancedInput {
    const amountsIn = this.helpers.toSdkInputAmounts(humanAmountsIn)

    return {
      chainId: this.helpers.chainId,
      rpcUrl: getRpcUrl(this.helpers.chainId),
      amountsIn,
      kind: AddLiquidityKind.Unbalanced,
      sender: getSender(userAddress),
    }
  }
}
