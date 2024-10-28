import { Path, Slippage, Swap, SwapKind, TokenAmount } from '@balancer/sdk'
import { getChainId } from '@repo/lib/config/app.config'
import { GqlSorSwapType } from '@repo/lib/shared/services/api/generated/graphql'
import { TransactionConfig } from '../../web3/contracts/contract.types'
import { SdkBuildSwapInputs, SdkSimulateSwapResponse, SimulateSwapInputs } from '../swap.types'
import { SwapHandler } from './Swap.handler'
import { formatUnits } from 'viem'
import { getRpcUrl } from '../../web3/transports'
import { bn } from '@repo/lib/shared/utils/numbers'
import { ProtocolVersion } from '../../pool/pool.types'

/**
 * Base abstract class that shares common logic shared by Default standard swaps and single pool swaps.
 */
export abstract class BaseDefaultSwapHandler implements SwapHandler {
  public abstract name: string
  public abstract simulate({ ...variables }: SimulateSwapInputs): Promise<SdkSimulateSwapResponse>

  build({
    simulateResponse: { swap, queryOutput, protocolVersion },
    slippagePercent,
    account,
    selectedChain,
    wethIsEth,
    permit2,
  }: SdkBuildSwapInputs): TransactionConfig {
    const baseBuildCallParams = {
      slippage: Slippage.fromPercentage(slippagePercent as `${number}`),
      deadline: BigInt(Number.MAX_SAFE_INTEGER),
      wethIsEth,
      queryOutput,
    }
    const isV3SwapRoute = protocolVersion === 3

    const buildCallParams = isV3SwapRoute
      ? baseBuildCallParams
      : { ...baseBuildCallParams, sender: account, recipient: account }

    const tx =
      isV3SwapRoute && permit2
        ? swap.buildCallWithPermit2(buildCallParams, permit2)
        : swap.buildCall(buildCallParams)

    return {
      account,
      chainId: getChainId(selectedChain),
      data: tx.callData,
      value: tx.value,
      to: tx.to,
    }
  }

  /**
   * PRIVATE METHODS
   */
  protected async runSimulation({
    protocolVersion,
    swapInputs,
    paths,
    hopCount,
  }: {
    protocolVersion: ProtocolVersion
    swapInputs: SimulateSwapInputs
    paths: Path[]
    hopCount: number
  }): Promise<SdkSimulateSwapResponse> {
    const { chain, swapType, swapAmount } = swapInputs

    // Get accurate return amount with onchain call
    const rpcUrl = getRpcUrl(getChainId(chain))

    const swap = new Swap({
      chainId: getChainId(chain),
      paths,
      swapKind: this.swapTypeToKind(swapType),
    })

    const queryOutput = await swap.query(rpcUrl)
    let onchainReturnAmount: TokenAmount
    if (queryOutput.swapKind === SwapKind.GivenIn) {
      onchainReturnAmount = queryOutput.expectedAmountOut
    } else {
      onchainReturnAmount = queryOutput.expectedAmountIn
    }

    // Format return amount to human readable
    const returnAmount = formatUnits(onchainReturnAmount.amount, onchainReturnAmount.token.decimals)

    return {
      protocolVersion,
      hopCount,
      swapType,
      returnAmount,
      swap,
      queryOutput,
      effectivePrice: bn(swapAmount).div(returnAmount).toString(),
      effectivePriceReversed: bn(returnAmount).div(swapAmount).toString(),
    }
  }

  protected swapTypeToKind(swapType: GqlSorSwapType): SwapKind {
    switch (swapType) {
      case GqlSorSwapType.ExactIn:
        return SwapKind.GivenIn
      case GqlSorSwapType.ExactOut:
        return SwapKind.GivenOut
      default:
        throw new Error('Invalid swap type')
    }
  }
}
