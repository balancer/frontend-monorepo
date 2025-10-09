import { Address, encodeAbiParameters, encodeFunctionData } from 'viem'
import { magpieRouterV3_1Abi } from '@repo/lib/modules/web3/contracts/abi/beets/magpieRouterV3_1Abi'

export type ConvertLstToWethMessage = {
  router: Address
  sender: Address
  recipient: Address
  fromAsset: Address
  toAsset: Address
  deadline: bigint
  amountOutMin: bigint
  swapFee: bigint
  amountIn: bigint
}

export function getConvertLstToWethData(message: ConvertLstToWethMessage | undefined) {
  if (!message) return

  const swapData = encodeAbiParameters(
    [
      {
        name: 'Swap',
        type: 'tuple',
        components: [
          {
            name: 'router',
            type: 'address',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'recipient',
            type: 'address',
          },
          {
            name: 'fromAsset',
            type: 'address',
          },
          {
            name: 'toAsset',
            type: 'address',
          },
          {
            name: 'deadline',
            type: 'uint256',
          },
          {
            name: 'amountOutMin',
            type: 'uint256',
          },
          {
            name: 'swapFee',
            type: 'uint256',
          },
          {
            name: 'amountIn',
            type: 'uint256',
          },
        ],
      },
    ],
    [message]
  )

  return encodeFunctionData({
    abi: magpieRouterV3_1Abi,
    functionName: 'swapWithMagpieSignature',
    args: [swapData],
  })
}
