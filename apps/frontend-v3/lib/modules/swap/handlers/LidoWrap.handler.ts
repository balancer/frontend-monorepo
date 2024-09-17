import { getChainId } from '@/lib/config/app.config'
import { SwapHandler } from './Swap.handler'
import { TransactionConfig } from '../../web3/contracts/contract.types'
import {
  OWrapType,
  SdkBuildSwapInputs,
  SimulateSwapInputs,
  SimulateSwapResponse,
  WrapType,
} from '../swap.types'
import { getWrapConfig, getWrapType } from '../wrap.helpers'
import { Address, encodeFunctionData, formatUnits } from 'viem'
import { Hex } from 'viem'
import { bn } from '@/lib/shared/utils/numbers'
import { getViemClient } from '@/lib/shared/services/viem/viem.client'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'

const lidoRateProviderMap: Partial<Record<GqlChain, Address>> = {
  [GqlChain.Mainnet]: '0x72d07d7dca67b8a406ad1ec34ce969c90bfee768',
}

export class LidoWrapHandler implements SwapHandler {
  name = 'LidoWrapHandler'

  async simulate({ ...variables }: SimulateSwapInputs): Promise<SimulateSwapResponse> {
    const wrapType = getWrapType(variables.tokenIn, variables.tokenOut, variables.chain)
    if (!wrapType) throw new Error('LidoWrapHandler called with non valid wrap tokens')

    const returnAmount = await this.applyRate(variables.swapAmount, wrapType, variables.chain)

    return {
      swapType: variables.swapType,
      effectivePrice: '1',
      effectivePriceReversed: '1',
      returnAmount,
    }
  }

  build({ tokenIn, tokenOut, account, selectedChain }: SdkBuildSwapInputs): TransactionConfig {
    const wrapType = getWrapType(tokenIn.address, tokenOut.address, selectedChain)
    if (!wrapType) throw new Error('Non valid wrap tokens')

    const { wrappedToken } = getWrapConfig(tokenIn.address, tokenOut.address, selectedChain)

    let data: Hex | undefined
    if (wrapType === OWrapType.WRAP) {
      data = this.buildWrapCallData(tokenIn.scaledAmount)
    } else if (wrapType === OWrapType.UNWRAP) {
      data = this.buildUnwrapCallData(tokenIn.scaledAmount)
    }

    if (!data) throw new Error('Could not build data')

    return {
      account,
      chainId: getChainId(selectedChain),
      data,
      to: wrappedToken,
    }
  }

  private buildWrapCallData(scaledAmount: bigint) {
    return encodeFunctionData({
      abi: [
        {
          inputs: [{ name: '_stETHAmount', type: 'uint256' }],
          name: 'wrap',
          outputs: [{ name: 'amount', type: 'uint256' }],
          stateMutability: '',
          type: 'function',
        },
      ],
      functionName: 'wrap',
      args: [scaledAmount],
    })
  }

  private buildUnwrapCallData(scaledAmount: bigint) {
    return encodeFunctionData({
      abi: [
        {
          inputs: [{ name: '_wstETHAmount', type: 'uint256' }],
          name: 'unwrap',
          outputs: [{ name: 'amount', type: 'uint256' }],
          stateMutability: '',
          type: 'function',
        },
      ],
      functionName: 'unwrap',
      args: [scaledAmount],
    })
  }

  private async applyRate(amount: string, wrapType: WrapType | null, chain: GqlChain) {
    const viemClient = getViemClient(chain)
    const rateProviderAddress = lidoRateProviderMap[chain]

    if (!rateProviderAddress) throw new Error('No rate provider for chain')

    const rateScaled = await viemClient.readContract({
      abi: [
        {
          inputs: [],
          name: 'getRate',
          outputs: [{ name: 'amount', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      address: rateProviderAddress,
      functionName: 'getRate',
    })

    const rate = formatUnits(rateScaled, 18)

    return wrapType === OWrapType.WRAP
      ? bn(amount).times(1).div(rate).toString()
      : bn(amount).times(rate).div(1).toString()
  }
}
