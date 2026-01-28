import {
  AddLiquidityBoostedBuildCallInput,
  AddLiquidityBoostedProportionalInput,
  AddLiquidityBoostedV3,
  AddLiquidityKind,
  Address,
  Hex,
  InputAmount,
  isSameAddress,
} from '@balancer/sdk'
import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { getRpcUrl } from '@repo/lib/modules/web3/transports'
import { Pool } from '../../../pool.types'
import { getSender, LiquidityActionHelpers } from '../../LiquidityActionHelpers'
import { SdkBuildAddLiquidityInput, SdkQueryAddLiquidityOutput } from '../add-liquidity.types'
import { constructBaseBuildCallInput } from './add-liquidity.utils'
import { AddLiquidityHandler } from './AddLiquidity.handler'
import { isEmpty } from 'lodash'
import { bn } from '@repo/lib/shared/utils/numbers'

export class ProportionalBoostedAddLiquidityV3 implements AddLiquidityHandler {
  protected helpers: LiquidityActionHelpers

  constructor(pool: Pool) {
    this.helpers = new LiquidityActionHelpers(pool)
  }

  public async getPriceImpact(): Promise<number> {
    return 0 // Proportional joins don't have price impact
  }

  public async simulate(
    humanAmountsIn: HumanTokenAmountWithSymbol[],
    userAddress: Address,
    referenceAmountAddress?: Address,
    slippage?: number
  ): Promise<SdkQueryAddLiquidityOutput> {
    // TODO: generalize to other handlers with referenceAmountAddress
    const inputAmounts = this.helpers.toSdkInputAmounts(humanAmountsIn)
    const foundReferenceAmount =
      referenceAmountAddress &&
      inputAmounts.find(item => isSameAddress(item.address, referenceAmountAddress))
    const referenceAmount = foundReferenceAmount || inputAmounts[0]
    // Apply slippage tolerance to the reference amount by reducing the raw amount
    referenceAmount.rawAmount = BigInt(
      bn(bn(referenceAmount.rawAmount).times(100 - (slippage || 0)))
        .div(100)
        .toFixed(0)
    )

    const addLiquidity = new AddLiquidityBoostedV3()

    const addLiquidityInput = this.constructSdkInput(referenceAmount, humanAmountsIn, userAddress)

    const sdkQueryOutput = await addLiquidity.query(
      addLiquidityInput,
      this.helpers.boostedPoolState
    )

    return {
      bptOut: sdkQueryOutput.bptOut,
      to: sdkQueryOutput.to,
      wrapUnderlying: sdkQueryOutput.wrapUnderlying,
      sdkQueryOutput,
    }
  }

  public async buildCallData({
    account,
    queryOutput,
    humanAmountsIn,
    slippagePercent,
    permit2,
  }: SdkBuildAddLiquidityInput): Promise<TransactionConfig> {
    const addLiquidity = new AddLiquidityBoostedV3()

    if (!queryOutput.wrapUnderlying) {
      throw new Error('Boosted add liquidity requires defined wrapUnderlying')
    }

    const buildCallParams: AddLiquidityBoostedBuildCallInput = {
      ...constructBaseBuildCallInput({
        humanAmountsIn,
        sdkQueryOutput: queryOutput.sdkQueryOutput,
        slippagePercent,
        pool: this.helpers.pool,
      }),
      protocolVersion: 3,
      userData: '0x' as Hex,
      wethIsEth: this.helpers.isNativeAssetIn(humanAmountsIn),
      wrapUnderlying: queryOutput.wrapUnderlying,
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
    referenceAmount: InputAmount,
    humanAmountsIn: HumanTokenAmountWithSymbol[],
    userAddress: Address
  ): AddLiquidityBoostedProportionalInput {
    return {
      chainId: this.helpers.chainId,
      rpcUrl: getRpcUrl(this.helpers.chainId),
      referenceAmount,
      kind: AddLiquidityKind.Proportional,
      sender: getSender(userAddress),
      tokensIn: humanAmountsIn.filter(a => !isEmpty(a)).map(a => a.tokenAddress),
    }
  }
}
