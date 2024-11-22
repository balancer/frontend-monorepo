import {
  AddLiquidityNested,
  AddLiquidityNestedCallInputV3,
  AddLiquidityNestedInputV3,
  ChainId,
  PriceImpact,
  Slippage,
} from '@balancer/sdk'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { getRpcUrl } from '@repo/lib/modules/web3/transports'
import { Address, Hex } from 'viem'
import { Pool } from '../../../PoolProvider'
import { LiquidityActionHelpers, areEmptyAmounts } from '../../LiquidityActionHelpers'
import {
  NestedBuildAddLiquidityInputV3,
  NestedQueryAddLiquidityOutputV3,
} from '../add-liquidity.types'
import { AddLiquidityHandler } from './AddLiquidity.handler'

export class NestedAddLiquidityV3Handler implements AddLiquidityHandler {
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
      this.helpers.nestedPoolStateV3
    )
    return priceImpactABA.decimal
  }

  public async simulate(
    humanAmountsIn: HumanTokenAmountWithAddress[],
    userAddress: Address
  ): Promise<NestedQueryAddLiquidityOutputV3> {
    const addLiquidity = new AddLiquidityNested()

    const addLiquidityInput: AddLiquidityNestedInputV3 = {
      ...this.constructSdkInput(humanAmountsIn),
      sender: userAddress,
    }

    const sdkQueryOutput = await addLiquidity.query(
      addLiquidityInput,
      this.helpers.nestedPoolStateV3
    )

    return {
      bptOut: sdkQueryOutput.bptOut,
      to: sdkQueryOutput.to,
      sdkQueryOutput: {
        ...sdkQueryOutput,
        protocolVersion: 3,
        userData: '0x' as Hex,
        parentPool: this.helpers.pool.address as Address,
        chainId: this.helpers.chainId as ChainId,
      },
    }
  }

  public async buildCallData({
    account,
    slippagePercent,
    queryOutput,
    permit2,
  }: NestedBuildAddLiquidityInputV3): Promise<TransactionConfig> {
    const addLiquidity = new AddLiquidityNested()

    const buildCallParams: AddLiquidityNestedCallInputV3 = {
      ...queryOutput.sdkQueryOutput,
      slippage: Slippage.fromPercentage(`${Number(slippagePercent)}`),
      amountsIn: queryOutput.sdkQueryOutput.amountsIn,
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

  /**
   * PRIVATE METHODS
   */
  private constructSdkInput(
    humanAmountsIn: HumanTokenAmountWithAddress[]
  ): AddLiquidityNestedInputV3 {
    const amountsIn = this.helpers.toSdkInputAmounts(humanAmountsIn)

    const nonEmptyAmountsIn = amountsIn.filter(a => a.rawAmount !== 0n)

    return {
      chainId: this.helpers.chainId as ChainId,
      rpcUrl: getRpcUrl(this.helpers.chainId),
      amountsIn: nonEmptyAmountsIn,
    }
  }
}
