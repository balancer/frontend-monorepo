/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TransactionConfig } from '@/lib/modules/web3/contracts/contract.types'
import { AddLiquidity } from '@balancer/sdk'
import { formatBuildCallParams } from '../../LiquidityActionHelpers'
import { SdkBuildAddLiquidityInput } from '../add-liquidity.types'
import { BaseUnbalancedAddLiquidityHandler } from './BaseUnbalancedAddLiquidity.handler'
import { constructBaseBuildCallInput } from './add-liquidity.utils'

/**
 * UnbalancedAddLiquidityHandler is a handler that implements the
 * AddLiquidityHandler interface for unbalanced adds v2 pools, e.g. where the user
 * specifies the token amounts in. It uses the Balancer SDK to implement it's
 * methods. It also handles the case where one of the input tokens is the native
 * asset instead of the wrapped native asset.
 */
export class UnbalancedAddLiquidityV2Handler extends BaseUnbalancedAddLiquidityHandler {
  public async buildCallData({
    humanAmountsIn,
    slippagePercent,
    queryOutput,
    account,
  }: SdkBuildAddLiquidityInput): Promise<TransactionConfig> {
    const addLiquidity = new AddLiquidity()

    const buildCallParams = formatBuildCallParams(
      constructBaseBuildCallInput({
        humanAmountsIn,
        sdkQueryOutput: queryOutput.sdkQueryOutput,
        slippagePercent: slippagePercent,
        pool: this.helpers.pool,
      }),
      account
    )

    const { callData, to, value } = addLiquidity.buildCall(buildCallParams)

    return {
      account,
      chainId: this.helpers.chainId,
      data: callData,
      to,
      value,
    }
  }
}
