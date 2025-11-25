import { decodeFunctionData, Hex } from 'viem'

export function getConvertLstToWethData(data: Hex | undefined): `0x${string}` | undefined {
  if (!data) return undefined

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

  return decoded?.args?.[0] as `0x${string}`
}
