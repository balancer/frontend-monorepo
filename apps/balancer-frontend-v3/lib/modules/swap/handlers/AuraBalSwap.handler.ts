import { getChainId, getWrappedNativeAssetAddress } from '@/lib/config/app.config'
import { SwapHandler } from './Swap.handler'
import { GqlSorSwapType, GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { AuraBalSwap, HumanAmount, Slippage, SwapKind, Token, TokenAmount } from '@balancer/sdk'
import { formatUnits } from 'viem'
import { TransactionConfig } from '../../web3/contracts/contract.types'
import {
  AuraBalBuildSwapInputs,
  AuraBalSimulateSwapResponse,
  SimulateSwapInputs,
} from '../swap.types'
import { getRpcUrl } from '../../web3/transports'
import { isNativeAsset, isSameAddress } from '@/lib/shared/utils/addresses'
import { bn } from '@/lib/shared/utils/numbers'

export class AuraBalSwapHandler implements SwapHandler {
  name = 'AuraBalSwapHandler'

  constructor(public tokens: GqlToken[]) {}

  async simulate({ ...variables }: SimulateSwapInputs): Promise<AuraBalSimulateSwapResponse> {
    const { chain, swapType } = variables
    const rpcUrl = getRpcUrl(getChainId(chain))

    const tokenInAddress = isNativeAsset(chain, variables.tokenIn)
      ? getWrappedNativeAssetAddress(chain)
      : variables.tokenIn
    const tokenOutAddress = isNativeAsset(chain, variables.tokenOut)
      ? getWrappedNativeAssetAddress(chain)
      : variables.tokenOut

    const _tokenIn = this.tokens.find(token => isSameAddress(token.address, tokenInAddress))
    const _tokenOut = this.tokens.find(token => isSameAddress(token.address, tokenOutAddress))

    if (!_tokenIn || !_tokenOut) {
      throw new Error('Token not found')
    }

    const tokenIn = new Token(_tokenIn.chainId, tokenInAddress, _tokenIn.decimals)
    const tokenOut = new Token(_tokenOut.chainId, tokenOutAddress, _tokenOut.decimals)
    const swapAmountToken = swapType === GqlSorSwapType.ExactIn ? tokenIn : tokenOut
    const swapAmount = TokenAmount.fromHumanAmount(
      swapAmountToken,
      variables.swapAmount as HumanAmount
    )
    const kind = this.swapTypeToKind(swapType)

    const auraBalSwap = new AuraBalSwap(rpcUrl)

    const isAuraBalSwap = auraBalSwap.isAuraBalSwap({
      tokenIn,
      tokenOut,
      swapAmount,
      kind,
    })

    if (!isAuraBalSwap) throw new Error('Invalid auraBAL swap')

    // Get accurate return amount with onchain call
    const queryOutput = await auraBalSwap.query({
      tokenIn,
      tokenOut,
      swapAmount,
      kind,
    })

    // Format return amount to human readable
    const returnAmount = formatUnits(
      queryOutput.expectedAmountOut.amount,
      queryOutput.expectedAmountOut.token.decimals
    )

    return {
      returnAmount,
      queryOutput,
      swapType,
      effectivePrice: bn(variables.swapAmount).div(returnAmount).toString(),
      effectivePriceReversed: bn(returnAmount).div(variables.swapAmount).toString(),
    }
  }

  build({
    simulateResponse: { queryOutput },
    slippagePercent,
    account,
    selectedChain,
    relayerApprovalSignature,
    wethIsEth,
  }: AuraBalBuildSwapInputs): TransactionConfig {
    const rpcUrl = getRpcUrl(getChainId(selectedChain))

    const auraBalSwap = new AuraBalSwap(rpcUrl)

    const tx = auraBalSwap.buildCall({
      slippage: Slippage.fromPercentage(slippagePercent as HumanAmount),
      user: account,
      wethIsEth,
      queryOutput,
      relayerApprovalSignature,
    })

    return {
      account,
      chainId: getChainId(selectedChain),
      data: tx.callData,
      value: tx.value,
      to: tx.to,
    }
  }

  private swapTypeToKind(swapType: GqlSorSwapType): SwapKind {
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
