import {
  HumanAmount,
  InputAmount,
  RemoveLiquidity,
  RemoveLiquidityKind,
  RemoveLiquidityProportionalInput,
  Slippage,
} from '@balancer/sdk'
import { Address, parseEther } from 'viem'
import { BPT_DECIMALS } from '../../../pool.constants'
import { Pool } from '../../../PoolProvider'
import { LiquidityActionHelpers, formatBuildCallParams } from '../../LiquidityActionHelpers'
import {
  QueryRemoveLiquidityInput,
  SdkBuildRemoveLiquidityInput,
  SdkQueryRemoveLiquidityOutput,
} from '../remove-liquidity.types'
import { RemoveLiquidityHandler } from './RemoveLiquidity.handler'
import { TransactionConfig } from '../../../../web3/contracts/contract.types'
import { getRpcUrl } from '../../../../web3/transports'

export class ProportionalRemoveLiquidityHandler implements RemoveLiquidityHandler {
  helpers: LiquidityActionHelpers

  constructor(pool: Pool) {
    this.helpers = new LiquidityActionHelpers(pool)
  }

  public async simulate({
    humanBptIn: bptIn,
  }: QueryRemoveLiquidityInput): Promise<SdkQueryRemoveLiquidityOutput> {
    const removeLiquidity = new RemoveLiquidity()
    const removeLiquidityInput = this.constructSdkInput(bptIn)

    const sdkQueryOutput = await removeLiquidity.query(removeLiquidityInput, this.helpers.poolState)

    return { amountsOut: sdkQueryOutput.amountsOut.filter(a => a.amount > 0n), sdkQueryOutput }
  }

  public async getPriceImpact(): Promise<number> {
    // proportional remove liquidity does not have price impact
    return 0
  }

  public async buildCallData({
    account,
    slippagePercent,
    queryOutput,
    wethIsEth,
  }: SdkBuildRemoveLiquidityInput): Promise<TransactionConfig> {
    const removeLiquidity = new RemoveLiquidity()

    const baseBuildCallParams = {
      ...queryOutput.sdkQueryOutput,
      slippage: Slippage.fromPercentage(`${Number(slippagePercent)}`),
      wethIsEth,
    }

    const buildCallParams = formatBuildCallParams(
      baseBuildCallParams,
      this.helpers.isV3Pool(),
      account,
    )

    const { callData, to, value } = removeLiquidity.buildCall(buildCallParams)

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
  protected constructSdkInput(humanBptIn: HumanAmount): RemoveLiquidityProportionalInput {
    const bptIn: InputAmount = {
      rawAmount: parseEther(humanBptIn),
      decimals: BPT_DECIMALS,
      address: this.helpers.pool.address as Address,
    }

    return {
      chainId: this.helpers.chainId,
      rpcUrl: getRpcUrl(this.helpers.chainId),
      bptIn,
      kind: RemoveLiquidityKind.Proportional,
    }
  }
}