export const merklClaimsAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'users', type: 'address[]' },
      { name: 'tokens', type: 'address[]' },
      { name: 'amounts', type: 'uint256[]' },
      { name: 'proofs', type: 'bytes32[][]' },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    inputs: [],
    name: 'InvalidDispute',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidLengths',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidProof',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidUninitializedRoot',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoDispute',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotGovernor',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotTrusted',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotWhitelisted',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnresolvedDispute',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroAddress',
    type: 'error',
  },
] as const
