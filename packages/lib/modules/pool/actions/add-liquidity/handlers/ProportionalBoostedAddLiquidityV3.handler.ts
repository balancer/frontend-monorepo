import {
  AddLiquidityBoostedBuildCallInput,
  AddLiquidityBoostedV3,
  AddLiquidityKind,
  AddLiquidityProportionalInput,
  Address,
  Hex,
  InputAmount,
  isSameAddress,
} from '@balancer/sdk'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { getRpcUrl } from '@repo/lib/modules/web3/transports'
import { Pool } from '../../../PoolProvider'
import { LiquidityActionHelpers } from '../../LiquidityActionHelpers'
import { SdkBuildAddLiquidityInput, SdkQueryAddLiquidityOutput } from '../add-liquidity.types'
import { constructBaseBuildCallInput } from './add-liquidity.utils'
import { AddLiquidityHandler } from './AddLiquidity.handler'

export class ProportionalBoostedAddLiquidityV3 implements AddLiquidityHandler {
  protected helpers: LiquidityActionHelpers

  constructor(pool: Pool) {
    this.helpers = new LiquidityActionHelpers(pool)
  }

  public async getPriceImpact(): Promise<number> {
    return 0 // Proportional joins don't have price impact
  }

  public async simulate(
    humanAmountsIn: HumanTokenAmountWithAddress[],
    userAddress: Address,
    referenceAmountAddress?: Address
  ): Promise<SdkQueryAddLiquidityOutput> {
    // TODO: generalize to other handlers with referenceAmountAddress
    const inputAmounts = this.helpers.toSdkInputAmounts(humanAmountsIn)
    const foundReferenceAmount =
      referenceAmountAddress &&
      inputAmounts.find(item => isSameAddress(item.address, referenceAmountAddress))
    const referenceAmount = foundReferenceAmount || inputAmounts[0]

    console.log({ referenceAmount })

    const addLiquidity = new AddLiquidityBoostedV3()

    const addLiquidityInput = this.constructSdkInput(referenceAmount, userAddress)
    const sdkQueryOutput = await addLiquidity.query(
      addLiquidityInput,
      this.helpers.boostedPoolState
    )

    return { bptOut: sdkQueryOutput.bptOut, to: sdkQueryOutput.to, sdkQueryOutput }
  }

  public async buildCallData({
    account,
    queryOutput,
    humanAmountsIn,
    slippagePercent,
    permit2,
  }: SdkBuildAddLiquidityInput): Promise<TransactionConfig> {
    const addLiquidity = new AddLiquidityBoostedV3()

    const buildCallParams: AddLiquidityBoostedBuildCallInput = {
      ...constructBaseBuildCallInput({
        humanAmountsIn,
        sdkQueryOutput: queryOutput.sdkQueryOutput,
        slippagePercent: slippagePercent,
        pool: this.helpers.pool,
      }),
      protocolVersion: 3,
      userData: '0x' as Hex,
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
    userAddress: Address
  ): AddLiquidityProportionalInput {
    return {
      chainId: this.helpers.chainId,
      rpcUrl: getRpcUrl(this.helpers.chainId),
      referenceAmount,
      kind: AddLiquidityKind.Proportional,
      sender: userAddress,
    }
  }
}
