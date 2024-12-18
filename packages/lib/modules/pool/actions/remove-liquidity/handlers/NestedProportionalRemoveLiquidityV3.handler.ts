import {
  HumanAmount,
  RemoveLiquidityNested,
  RemoveLiquidityNestedCallInputV3,
  RemoveLiquidityNestedProportionalInputV3,
  RemoveLiquidityNestedQueryOutput,
  RemoveLiquidityNestedV3,
  Slippage,
} from '@balancer/sdk'
import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { getRpcUrl } from '@repo/lib/modules/web3/transports'
import { Address, Hex, parseEther } from 'viem'
import { Pool } from '../../../PoolProvider'
import { getSender, LiquidityActionHelpers } from '../../LiquidityActionHelpers'
import {
  BuildRemoveLiquidityInput,
  QueryRemoveLiquidityInput,
  QueryRemoveLiquidityOutput,
} from '../remove-liquidity.types'
import { RemoveLiquidityHandler } from './RemoveLiquidity.handler'

export interface NestedProportionalQueryRemoveLiquidityOutput extends QueryRemoveLiquidityOutput {
  sdkQueryOutput: RemoveLiquidityNestedQueryOutput
}

export interface NestedProportionalQueryRemoveLiquidityInput extends BuildRemoveLiquidityInput {
  queryOutput: NestedProportionalQueryRemoveLiquidityOutput
}

export class NestedProportionalRemoveLiquidityV3Handler implements RemoveLiquidityHandler {
  helpers: LiquidityActionHelpers

  constructor(pool: Pool) {
    this.helpers = new LiquidityActionHelpers(pool)
  }

  public async getPriceImpact(): Promise<number> {
    // proportional remove liquidity does not have price impact
    return 0
  }

  public async simulate({
    humanBptIn,
    userAddress,
  }: QueryRemoveLiquidityInput): Promise<NestedProportionalQueryRemoveLiquidityOutput> {
    const removeLiquidity = new RemoveLiquidityNestedV3()

    const removeLiquidityInput: RemoveLiquidityNestedProportionalInputV3 = this.constructSdkInput(
      humanBptIn,
      userAddress
    )

    const sdkQueryOutput = await removeLiquidity.query(
      removeLiquidityInput,
      this.helpers.nestedPoolStateV3
    )

    console.log('price simulation v3 result: ', { sdkQueryOutput })

    return { amountsOut: sdkQueryOutput.amountsOut, sdkQueryOutput }
  }

  public async buildCallData({
    account,
    slippagePercent,
    queryOutput,
    permit,
  }: NestedProportionalQueryRemoveLiquidityInput): Promise<TransactionConfig> {
    const removeLiquidity = new RemoveLiquidityNested()

    const buildCallParams: RemoveLiquidityNestedCallInputV3 = {
      ...queryOutput.sdkQueryOutput,
      protocolVersion: 3,
      userData: '0x' as Hex,
      slippage: Slippage.fromPercentage(`${Number(slippagePercent)}`),
      parentPool: this.helpers.pool.address as Address,
    }

    const { callData, to } = permit
      ? removeLiquidity.buildCallWithPermit(buildCallParams, permit)
      : removeLiquidity.buildCall(buildCallParams)

    return {
      account,
      chainId: this.helpers.chainId,
      data: callData,
      to,
    }
  }

  /**
   * PRIVATE METHODS
   */
  private constructSdkInput(
    humanBptIn: HumanAmount,
    userAddress: Address
  ): RemoveLiquidityNestedProportionalInputV3 {
    const result: RemoveLiquidityNestedProportionalInputV3 = {
      bptAmountIn: parseEther(humanBptIn),
      chainId: this.helpers.chainId,
      rpcUrl: getRpcUrl(this.helpers.chainId),
      sender: getSender(userAddress),
    }

    return result
  }
}
