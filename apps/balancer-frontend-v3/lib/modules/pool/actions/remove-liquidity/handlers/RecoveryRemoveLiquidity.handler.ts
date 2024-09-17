import {
  Address,
  HumanAmount,
  InputAmount,
  RemoveLiquidity,
  RemoveLiquidityKind,
  RemoveLiquidityRecoveryInput,
  Slippage,
} from '@balancer/sdk'
import { Pool } from '../../../PoolProvider'
import {
  QueryRemoveLiquidityInput,
  SdkBuildRemoveLiquidityInput,
  SdkQueryRemoveLiquidityOutput,
} from '../remove-liquidity.types'
import { TransactionConfig } from '@/lib/modules/web3/contracts/contract.types'
import { parseEther } from 'viem'
import { BPT_DECIMALS } from '../../../pool.constants'
import { LiquidityActionHelpers } from '../../LiquidityActionHelpers'
import { getRpcUrl } from '@/lib/modules/web3/transports'

/*
 A recovery exit is just a Proportional one but with Recovery kind
 but we explicitly avoid using inheritance so that both handlers are independent and clearer to understand
*/
export class RecoveryRemoveLiquidityHandler {
  helpers: LiquidityActionHelpers

  constructor(pool: Pool) {
    this.helpers = new LiquidityActionHelpers(pool)
  }

  public async getPriceImpact(): Promise<number> {
    // Recovery is a custom type of proportional remove liquidity so it does not have price impact
    return 0
  }

  public async simulate({
    humanBptIn: bptIn,
  }: QueryRemoveLiquidityInput): Promise<SdkQueryRemoveLiquidityOutput> {
    const removeLiquidity = new RemoveLiquidity()
    const removeLiquidityInput = this.constructSdkInput(bptIn)

    const sdkQueryOutput = await removeLiquidity.queryRemoveLiquidityRecovery(
      removeLiquidityInput,
      this.helpers.poolStateWithBalances
    )

    return { amountsOut: sdkQueryOutput.amountsOut.filter(a => a.amount > 0n), sdkQueryOutput }
  }

  public async buildCallData({
    account,
    slippagePercent,
    queryOutput,
  }: SdkBuildRemoveLiquidityInput): Promise<TransactionConfig> {
    const removeLiquidity = new RemoveLiquidity()

    const { callData, to, value } = removeLiquidity.buildCall({
      ...queryOutput.sdkQueryOutput,
      slippage: Slippage.fromPercentage(`${Number(slippagePercent)}`),
      sender: account,
      recipient: account,
      wethIsEth: false, // assuming we don't want to withdraw the native asset over the wrapped native asset for now.
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
  protected constructSdkInput(humanBptIn: HumanAmount): RemoveLiquidityRecoveryInput {
    const bptIn: InputAmount = {
      rawAmount: parseEther(humanBptIn),
      decimals: BPT_DECIMALS,
      address: this.helpers.pool.address as Address,
    }

    return {
      chainId: this.helpers.chainId,
      rpcUrl: getRpcUrl(this.helpers.chainId),
      bptIn,
      kind: RemoveLiquidityKind.Recovery,
    }
  }
}
