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

  const convertedMessage = {
    ...message,
    deadline: BigInt(message.deadline),
    amountOutMin: BigInt(message.amountOutMin),
    swapFee: BigInt(message.swapFee),
    amountIn: BigInt(message.amountIn),
  }

  console.log({ convertedMessage })

  const swapData = encodeAbiParameters(
    [
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
    [
      convertedMessage.router,
      convertedMessage.sender,
      convertedMessage.recipient,
      convertedMessage.fromAsset,
      convertedMessage.toAsset,
      convertedMessage.deadline,
      convertedMessage.amountOutMin,
      convertedMessage.swapFee,
      convertedMessage.amountIn,
    ]
  )

  return encodeFunctionData({
    abi: magpieRouterV3_1Abi,
    functionName: 'swapWithMagpieSignature',
    args: [swapData],
  })
}
