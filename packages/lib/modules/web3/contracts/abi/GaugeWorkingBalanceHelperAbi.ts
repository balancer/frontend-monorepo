export const GaugeWorkingBalanceHelperAbi = [
  {
    inputs: [
      {
        internalType: 'contract IVeDelegationProxy',
        name: 'veDelegationProxy',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'readTotalSupplyFromVE',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'getVotingEscrow',
    outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getVotingEscrowDelegationProxy',
    outputs: [
      {
        internalType: 'contract IVeDelegation',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IGauge', name: 'gauge', type: 'address' },
      { internalType: 'address', name: 'user', type: 'address' },
    ],
    name: 'getWorkingBalanceToSupplyRatios',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IGauge', name: 'gauge', type: 'address' },
      { internalType: 'address', name: 'user', type: 'address' },
    ],
    name: 'getWorkingBalances',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'readsTotalSupplyFromVE',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
]
