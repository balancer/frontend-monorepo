import {
  Address,
  Hex,
  HumanAmount,
  InputAmount,
  RemoveLiquidity,
  RemoveLiquidityKind,
  RemoveLiquidityRecoveryInput,
  Slippage,
} from '@balancer/sdk'
import { Pool } from '../../../pool.types'
import {
  QueryRemoveLiquidityInput,
  SdkBuildRemoveLiquidityInput,
  SdkQueryRemoveLiquidityOutput,
} from '../remove-liquidity.types'
import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { parseEther } from 'viem'
import { BPT_DECIMALS } from '../../../pool.constants'
import { getSender, LiquidityActionHelpers } from '../../LiquidityActionHelpers'
import { getRpcUrl } from '@repo/lib/modules/web3/transports'

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
    userAddress,
  }: QueryRemoveLiquidityInput): Promise<SdkQueryRemoveLiquidityOutput> {
    const removeLiquidity = new RemoveLiquidity()
    const removeLiquidityInput: RemoveLiquidityRecoveryInput = this.constructSdkInput(
      bptIn,
      userAddress
    )

    const sdkQueryOutput = await removeLiquidity.query(removeLiquidityInput, this.helpers.poolState)

    return { amountsOut: sdkQueryOutput.amountsOut.filter(a => a.amount > 0n), sdkQueryOutput }
  }

  public async buildCallData({
    account,
    slippagePercent,
    queryOutput,
  }: SdkBuildRemoveLiquidityInput): Promise<TransactionConfig> {
    const removeLiquidity = new RemoveLiquidity()
    const protocolVersion = queryOutput.sdkQueryOutput.protocolVersion

    const buildCallParams = {
      ...queryOutput.sdkQueryOutput,
      slippage: Slippage.fromPercentage(`${Number(slippagePercent)}`),
      recipient: account,
      wethIsEth: false, // assuming we don't want to withdraw the native asset over the wrapped native asset for now.
      protocolVersion,
      userData: '0x' as Hex,
    }

    const { callData, to, value } = removeLiquidity.buildCall(
      // sender should now be passed for V3 pools
      protocolVersion !== 3 ? { ...buildCallParams, sender: account } : buildCallParams
    )

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
  protected constructSdkInput(
    humanBptIn: HumanAmount,
    userAddress: Address
  ): RemoveLiquidityRecoveryInput {
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
      sender: getSender(userAddress),
    }
  }
}
