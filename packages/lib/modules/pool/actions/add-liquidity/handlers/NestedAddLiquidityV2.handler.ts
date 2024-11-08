import {
  AddLiquidityNested,
  AddLiquidityNestedCallInputV2,
  AddLiquidityNestedInput,
  AddLiquidityNestedQueryOutputV2,
  ChainId,
  PriceImpact,
  Slippage,
} from '@balancer/sdk'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { getRpcUrl } from '@repo/lib/modules/web3/transports'
import { Pool } from '../../../PoolProvider'
import { LiquidityActionHelpers, areEmptyAmounts } from '../../LiquidityActionHelpers'
import {
  NestedBuildAddLiquidityInput,
  NestedQueryAddLiquidityOutputV2,
} from '../add-liquidity.types'
import { AddLiquidityHandler } from './AddLiquidity.handler'
import { Address } from 'viem'

export class NestedAddLiquidityV2Handler implements AddLiquidityHandler {
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
    const priceImpactABA = await PriceImpact.addLiquidityNested(
      input,
      this.helpers.nestedPoolStateV2
    )
    return priceImpactABA.decimal
  }

  public async simulate(
    humanAmountsIn: HumanTokenAmountWithAddress[],
    userAddress: Address
  ): Promise<NestedQueryAddLiquidityOutputV2> {
    const addLiquidity = new AddLiquidityNested()

    const addLiquidityInput = this.constructSdkInput(humanAmountsIn, userAddress)

    const sdkQueryOutput: AddLiquidityNestedQueryOutputV2 = (await addLiquidity.query(
      addLiquidityInput,
      this.helpers.nestedPoolStateV2
    )) as AddLiquidityNestedQueryOutputV2

    return { bptOut: sdkQueryOutput.bptOut, to: sdkQueryOutput.to, sdkQueryOutput }
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
    } as AddLiquidityNestedCallInputV2)

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
    humanAmountsIn: HumanTokenAmountWithAddress[],
    userAddress?: Address
  ): AddLiquidityNestedInput {
    const amountsIn = this.helpers.toSdkInputAmounts(humanAmountsIn)

    const nonEmptyAmountsIn = amountsIn.filter(a => a.rawAmount !== 0n)

    return {
      chainId: this.helpers.chainId as ChainId,
      rpcUrl: getRpcUrl(this.helpers.chainId),
      amountsIn: nonEmptyAmountsIn,
      sender: userAddress,
    }
  }
}
