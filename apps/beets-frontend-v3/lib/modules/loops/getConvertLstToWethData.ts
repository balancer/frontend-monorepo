import { decodeFunctionData } from 'viem'

export function getConvertLstToWethData(data: any) {
  if (!data) return

  const abi = [
    {
      inputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
      name: 'swapWithMagpieSignature',
      outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
      stateMutability: 'payable',
      type: 'function',
    },
  ]

  const decoded = decodeFunctionData({
    abi,
    data,
  })

  console.log({ decoded })

  return decoded?.args?.[0] as `0x${string}`
}
