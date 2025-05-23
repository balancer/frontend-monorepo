import { AbiItem, erc20Abi } from 'viem'

const increaseApprovalAbiItem: AbiItem = {
  inputs: [
    { internalType: 'address', name: 'spender', type: 'address' },
    { internalType: 'uint256', name: 'amount', type: 'uint256' },
  ],
  name: 'increaseApproval',
  outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  stateMutability: 'nonpayable',
  type: 'function',
} as const

/*
  Edge case:
  when locking veBalBPT for getting veBal, the veBalBPT contract must use its increaseApproval function
  instead of the standard Erc20 approve function.
  Here we extend the erc20Abi with the increaseApproval function to cover that edge case in the generic token approval flow.
*/
export const erc20AbiWithIncreaseApproval = [...erc20Abi, increaseApprovalAbiItem] as const
