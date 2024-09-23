import { getChainId, getNetworkConfig } from '@/lib/config/app.config'
import { SwapHandler } from './Swap.handler'
import { ApolloClient } from '@apollo/client'
import { TransactionConfig } from '../../web3/contracts/contract.types'
import {
  OWrapType,
  SdkBuildSwapInputs,
  SimulateSwapInputs,
  SimulateSwapResponse,
} from '../swap.types'
import { getWrapType } from '../wrap.helpers'
import { encodeFunctionData } from 'viem'
import { Hex } from 'viem'

export class NativeWrapHandler implements SwapHandler {
  name = 'NativeWrapHandler'

  constructor(public apolloClient: ApolloClient<object>) {}

  async simulate({ ...variables }: SimulateSwapInputs): Promise<SimulateSwapResponse> {
    return {
      swapType: variables.swapType,
      effectivePrice: '1',
      effectivePriceReversed: '1',
      returnAmount: variables.swapAmount,
    }
  }

  build({ tokenIn, tokenOut, account, selectedChain }: SdkBuildSwapInputs): TransactionConfig {
    const wrapType = getWrapType(tokenIn.address, tokenOut.address, selectedChain)
    if (!wrapType) throw new Error('Non valid wrap tokens')

    const { tokens } = getNetworkConfig(selectedChain)

    let data: Hex | undefined
    if (wrapType === OWrapType.WRAP) {
      data = this.buildWrapCallData()
    } else if (wrapType === OWrapType.UNWRAP) {
      data = this.buildUnwrapCallData(tokenIn.scaledAmount)
    }

    if (!data) throw new Error('Could not build data')

    const value = wrapType === OWrapType.WRAP ? tokenIn.scaledAmount : BigInt(0)

    return {
      account,
      chainId: getChainId(selectedChain),
      data,
      value,
      to: tokens.addresses.wNativeAsset,
    }
  }

  private buildWrapCallData() {
    return encodeFunctionData({
      abi: [
        {
          inputs: [],
          name: 'deposit',
          outputs: [],
          stateMutability: 'payable',
          type: 'function',
        },
      ],
      functionName: 'deposit',
    })
  }

  private buildUnwrapCallData(scaledAmount: bigint) {
    return encodeFunctionData({
      abi: [
        {
          inputs: [{ name: 'amount', type: 'uint256' }],
          name: 'withdraw',
          outputs: [],
          stateMutability: '',
          type: 'function',
        },
      ],
      functionName: 'withdraw',
      args: [scaledAmount],
    })
  }
}
