//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BalancerMinter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x239e55F427D44C3cc793f49bFB507ebe76638a2b)
 */
export const balancerMinterAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'tokenAdmin',
        internalType: 'contract IBalancerTokenAdmin',
        type: 'address',
      },
      {
        name: 'gaugeController',
        internalType: 'contract IGaugeController',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'recipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'gauge',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'minted',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Minted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'minter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approval', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'MinterApprovalSet',
  },
  {
    type: 'function',
    inputs: [
      { name: 'minter', internalType: 'address', type: 'address' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'allowed_to_mint_for',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getBalancerToken',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getBalancerTokenAdmin',
    outputs: [
      {
        name: '',
        internalType: 'contract IBalancerTokenAdmin',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getDomainSeparator',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getGaugeController',
    outputs: [{ name: '', internalType: 'contract IGaugeController', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'minter', internalType: 'address', type: 'address' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'getMinterApproval',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getNextNonce',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'gauge', internalType: 'address', type: 'address' }],
    name: 'mint',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'gauge', internalType: 'address', type: 'address' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'mintFor',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'gauges', internalType: 'address[]', type: 'address[]' }],
    name: 'mintMany',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'gauges', internalType: 'address[]', type: 'address[]' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'mintManyFor',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'gauge', internalType: 'address', type: 'address' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'mint_for',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'gauges', internalType: 'address[8]', type: 'address[8]' }],
    name: 'mint_many',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'gauge', internalType: 'address', type: 'address' },
    ],
    name: 'minted',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'minter', internalType: 'address', type: 'address' },
      { name: 'approval', internalType: 'bool', type: 'bool' },
    ],
    name: 'setMinterApproval',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'minter', internalType: 'address', type: 'address' },
      { name: 'approval', internalType: 'bool', type: 'bool' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'setMinterApprovalWithSignature',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'minter', internalType: 'address', type: 'address' }],
    name: 'toggle_approve_mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x239e55F427D44C3cc793f49bFB507ebe76638a2b)
 */
export const balancerMinterAddress = {
  1: '0x239e55F427D44C3cc793f49bFB507ebe76638a2b',
} as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x239e55F427D44C3cc793f49bFB507ebe76638a2b)
 */
export const balancerMinterConfig = {
  address: balancerMinterAddress,
  abi: balancerMinterAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BalancerV2BalancerRelayerV6
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x35Cea9e57A393ac66Aaa7E25C391D52C74B5648f)
 */
export const balancerV2BalancerRelayerV6Abi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'vault', internalType: 'contract IVault', type: 'address' },
      { name: 'libraryAddress', internalType: 'address', type: 'address' },
      { name: 'queryLibrary', internalType: 'address', type: 'address' },
      { name: 'version', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getLibrary',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getQueryLibrary',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getVault',
    outputs: [{ name: '', internalType: 'contract IVault', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'data', internalType: 'bytes[]', type: 'bytes[]' }],
    name: 'multicall',
    outputs: [{ name: 'results', internalType: 'bytes[]', type: 'bytes[]' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'data', internalType: 'bytes[]', type: 'bytes[]' }],
    name: 'vaultActionsQueryMulticall',
    outputs: [{ name: 'results', internalType: 'bytes[]', type: 'bytes[]' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'version',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x35Cea9e57A393ac66Aaa7E25C391D52C74B5648f)
 */
export const balancerV2BalancerRelayerV6Address = {
  1: '0x35Cea9e57A393ac66Aaa7E25C391D52C74B5648f',
} as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x35Cea9e57A393ac66Aaa7E25C391D52C74B5648f)
 */
export const balancerV2BalancerRelayerV6Config = {
  address: balancerV2BalancerRelayerV6Address,
  abi: balancerV2BalancerRelayerV6Abi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BalancerV2BatchRelayerLibrary
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xea66501df1a00261e3bb79d1e90444fc6a186b62)
 */
export const balancerV2BatchRelayerLibraryAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'vault', internalType: 'contract IVault', type: 'address' },
      { name: 'wstETH', internalType: 'contract IERC20', type: 'address' },
      {
        name: 'minter',
        internalType: 'contract IBalancerMinter',
        type: 'address',
      },
      { name: 'canCallUserCheckpoint', internalType: 'bool', type: 'bool' },
      { name: 'version', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'contract IERC20', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approveVault',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'kind', internalType: 'enum IVault.SwapKind', type: 'uint8' },
      {
        name: 'swaps',
        internalType: 'struct IVault.BatchSwapStep[]',
        type: 'tuple[]',
        components: [
          { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
          { name: 'assetInIndex', internalType: 'uint256', type: 'uint256' },
          { name: 'assetOutIndex', internalType: 'uint256', type: 'uint256' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'userData', internalType: 'bytes', type: 'bytes' },
        ],
      },
      { name: 'assets', internalType: 'contract IAsset[]', type: 'address[]' },
      {
        name: 'funds',
        internalType: 'struct IVault.FundManagement',
        type: 'tuple',
        components: [
          { name: 'sender', internalType: 'address', type: 'address' },
          { name: 'fromInternalBalance', internalType: 'bool', type: 'bool' },
          {
            name: 'recipient',
            internalType: 'address payable',
            type: 'address',
          },
          { name: 'toInternalBalance', internalType: 'bool', type: 'bool' },
        ],
      },
      { name: 'limits', internalType: 'int256[]', type: 'int256[]' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      {
        name: 'outputReferences',
        internalType: 'struct VaultActions.OutputReference[]',
        type: 'tuple[]',
        components: [
          { name: 'index', internalType: 'uint256', type: 'uint256' },
          { name: 'key', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'batchSwap',
    outputs: [{ name: 'results', internalType: 'int256[]', type: 'int256[]' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'canCallUserCheckpoint',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'kind',
        internalType: 'enum VaultActions.PoolKind',
        type: 'uint8',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address payable', type: 'address' },
      {
        name: 'request',
        internalType: 'struct IVault.ExitPoolRequest',
        type: 'tuple',
        components: [
          {
            name: 'assets',
            internalType: 'contract IAsset[]',
            type: 'address[]',
          },
          {
            name: 'minAmountsOut',
            internalType: 'uint256[]',
            type: 'uint256[]',
          },
          { name: 'userData', internalType: 'bytes', type: 'bytes' },
          { name: 'toInternalBalance', internalType: 'bool', type: 'bool' },
        ],
      },
      {
        name: 'outputReferences',
        internalType: 'struct VaultActions.OutputReference[]',
        type: 'tuple[]',
        components: [
          { name: 'index', internalType: 'uint256', type: 'uint256' },
          { name: 'key', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'exitPool',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      {
        name: 'gauges',
        internalType: 'contract IStakingLiquidityGauge[]',
        type: 'address[]',
      },
    ],
    name: 'gaugeCheckpoint',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'gauges',
        internalType: 'contract IStakingLiquidityGauge[]',
        type: 'address[]',
      },
    ],
    name: 'gaugeClaimRewards',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'gauge',
        internalType: 'contract IStakingLiquidityGauge',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'gaugeDeposit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'gauges', internalType: 'address[]', type: 'address[]' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'gaugeMint',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'approval', internalType: 'bool', type: 'bool' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'gaugeSetMinterApproval',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'gauge',
        internalType: 'contract IStakingLiquidityGauge',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'gaugeWithdraw',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getEntrypoint',
    outputs: [{ name: '', internalType: 'contract IBalancerRelayer', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getVault',
    outputs: [{ name: '', internalType: 'contract IVault', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'kind',
        internalType: 'enum VaultActions.PoolKind',
        type: 'uint8',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      {
        name: 'request',
        internalType: 'struct IVault.JoinPoolRequest',
        type: 'tuple',
        components: [
          {
            name: 'assets',
            internalType: 'contract IAsset[]',
            type: 'address[]',
          },
          {
            name: 'maxAmountsIn',
            internalType: 'uint256[]',
            type: 'uint256[]',
          },
          { name: 'userData', internalType: 'bytes', type: 'bytes' },
          { name: 'fromInternalBalance', internalType: 'bool', type: 'bool' },
        ],
      },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'joinPool',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'ops',
        internalType: 'struct IVault.UserBalanceOp[]',
        type: 'tuple[]',
        components: [
          {
            name: 'kind',
            internalType: 'enum IVault.UserBalanceOpKind',
            type: 'uint8',
          },
          { name: 'asset', internalType: 'contract IAsset', type: 'address' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'sender', internalType: 'address', type: 'address' },
          {
            name: 'recipient',
            internalType: 'address payable',
            type: 'address',
          },
        ],
      },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      {
        name: 'outputReferences',
        internalType: 'struct VaultActions.OutputReference[]',
        type: 'tuple[]',
        components: [
          { name: 'index', internalType: 'uint256', type: 'uint256' },
          { name: 'key', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'manageUserBalance',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'ref', internalType: 'uint256', type: 'uint256' }],
    name: 'peekChainedReferenceValue',
    outputs: [{ name: 'value', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'relayer', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
      { name: 'authorisation', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'setRelayerApproval',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'stakeETH',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'stakeETHAndWrap',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'singleSwap',
        internalType: 'struct IVault.SingleSwap',
        type: 'tuple',
        components: [
          { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
          { name: 'kind', internalType: 'enum IVault.SwapKind', type: 'uint8' },
          { name: 'assetIn', internalType: 'contract IAsset', type: 'address' },
          {
            name: 'assetOut',
            internalType: 'contract IAsset',
            type: 'address',
          },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'userData', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: 'funds',
        internalType: 'struct IVault.FundManagement',
        type: 'tuple',
        components: [
          { name: 'sender', internalType: 'address', type: 'address' },
          { name: 'fromInternalBalance', internalType: 'bool', type: 'bool' },
          {
            name: 'recipient',
            internalType: 'address payable',
            type: 'address',
          },
          { name: 'toInternalBalance', internalType: 'bool', type: 'bool' },
        ],
      },
      { name: 'limit', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'swap',
    outputs: [{ name: 'result', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'staticToken',
        internalType: 'contract IStaticATokenLM',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'toUnderlying', internalType: 'bool', type: 'bool' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'unwrapAaveStaticToken',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract ICToken',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'unwrapCompoundV2',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'unwrapERC4626',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IEulerToken',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'unwrapEuler',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IGearboxDieselToken',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'dieselAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'unwrapGearbox',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'vaultToken',
        internalType: 'contract IReaperTokenVault',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'unwrapReaperVaultToken',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IShareToken',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'unwrapShareToken',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract ITetuSmartVault',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'unwrapTetu',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrapperToken',
        internalType: 'contract IUnbuttonToken',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'unwrapUnbuttonToken',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'unwrapWstETH',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IYearnTokenVault',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'unwrapYearn',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'contract IERC20Permit', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'vaultPermit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'token',
        internalType: 'contract IERC20PermitDAI',
        type: 'address',
      },
      { name: 'holder', internalType: 'address', type: 'address' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
      { name: 'expiry', internalType: 'uint256', type: 'uint256' },
      { name: 'allowed', internalType: 'bool', type: 'bool' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'vaultPermitDAI',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'staticToken',
        internalType: 'contract IStaticATokenLM',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'fromUnderlying', internalType: 'bool', type: 'bool' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'wrapAaveDynamicToken',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract ICToken',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'wrapCompoundV2',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'wrapERC4626',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IEulerToken',
        type: 'address',
      },
      { name: 'eulerProtocol', internalType: 'address', type: 'address' },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'wrapEuler',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IGearboxDieselToken',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'mainAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'wrapGearbox',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'vaultToken',
        internalType: 'contract IReaperTokenVault',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'wrapReaperVaultToken',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IShareToken',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'wrapShareToken',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'wrapStETH',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract ITetuSmartVault',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'wrapTetu',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrapperToken',
        internalType: 'contract IUnbuttonToken',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'uAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'wrapUnbuttonToken',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IYearnTokenVault',
        type: 'address',
      },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'outputReference', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'wrapYearn',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xea66501df1a00261e3bb79d1e90444fc6a186b62)
 */
export const balancerV2BatchRelayerLibraryAddress = {
  1: '0xeA66501dF1A00261E3bB79D1E90444fc6A186B62',
} as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xea66501df1a00261e3bb79d1e90444fc6a186b62)
 */
export const balancerV2BatchRelayerLibraryConfig = {
  address: balancerV2BatchRelayerLibraryAddress,
  abi: balancerV2BatchRelayerLibraryAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BalancerV2ComposableStablePoolV5
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xdacf5fa19b1f720111609043ac67a9818262850c)
 */
export const balancerV2ComposableStablePoolV5Abi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'params',
        internalType: 'struct ComposableStablePool.NewPoolParams',
        type: 'tuple',
        components: [
          { name: 'vault', internalType: 'contract IVault', type: 'address' },
          {
            name: 'protocolFeeProvider',
            internalType: 'contract IProtocolFeePercentagesProvider',
            type: 'address',
          },
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'symbol', internalType: 'string', type: 'string' },
          {
            name: 'tokens',
            internalType: 'contract IERC20[]',
            type: 'address[]',
          },
          {
            name: 'rateProviders',
            internalType: 'contract IRateProvider[]',
            type: 'address[]',
          },
          {
            name: 'tokenRateCacheDurations',
            internalType: 'uint256[]',
            type: 'uint256[]',
          },
          {
            name: 'exemptFromYieldProtocolFeeFlag',
            internalType: 'bool',
            type: 'bool',
          },
          {
            name: 'amplificationParameter',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'swapFeePercentage',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'pauseWindowDuration',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'bufferPeriodDuration',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'owner', internalType: 'address', type: 'address' },
          { name: 'version', internalType: 'string', type: 'string' },
        ],
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'startValue',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'endValue',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'startTime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'endTime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AmpUpdateStarted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'currentValue',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AmpUpdateStopped',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'paused', internalType: 'bool', type: 'bool', indexed: false }],
    name: 'PausedStateChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'feeType',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'protocolFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ProtocolFeePercentageCacheUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'enabled', internalType: 'bool', type: 'bool', indexed: false }],
    name: 'RecoveryModeStateChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'swapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SwapFeePercentageChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'rate',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TokenRateCacheUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'tokenIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'provider',
        internalType: 'contract IRateProvider',
        type: 'address',
        indexed: true,
      },
      {
        name: 'cacheDuration',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TokenRateProviderSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DELEGATE_PROTOCOL_SWAP_FEES_SENTINEL',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'decreaseAllowance',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'disableRecoveryMode',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'enableRecoveryMode',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'selector', internalType: 'bytes4', type: 'bytes4' }],
    name: 'getActionId',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getActualSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAmplificationParameter',
    outputs: [
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'isUpdating', internalType: 'bool', type: 'bool' },
      { name: 'precision', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAuthorizer',
    outputs: [{ name: '', internalType: 'contract IAuthorizer', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getBptIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getDomainSeparator',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getLastJoinExitData',
    outputs: [
      {
        name: 'lastJoinExitAmplification',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'lastPostJoinExitInvariant',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getMinimumBpt',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'getNextNonce',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPausedState',
    outputs: [
      { name: 'paused', internalType: 'bool', type: 'bool' },
      { name: 'pauseWindowEndTime', internalType: 'uint256', type: 'uint256' },
      { name: 'bufferPeriodEndTime', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPoolId',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'feeType', internalType: 'uint256', type: 'uint256' }],
    name: 'getProtocolFeePercentageCache',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getProtocolFeesCollector',
    outputs: [
      {
        name: '',
        internalType: 'contract IProtocolFeesCollector',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getProtocolSwapFeeDelegation',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getRate',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getRateProviders',
    outputs: [{ name: '', internalType: 'contract IRateProvider[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getScalingFactors',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getSwapFeePercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'contract IERC20', type: 'address' }],
    name: 'getTokenRate',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'contract IERC20', type: 'address' }],
    name: 'getTokenRateCache',
    outputs: [
      { name: 'rate', internalType: 'uint256', type: 'uint256' },
      { name: 'oldRate', internalType: 'uint256', type: 'uint256' },
      { name: 'duration', internalType: 'uint256', type: 'uint256' },
      { name: 'expires', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getVault',
    outputs: [{ name: '', internalType: 'contract IVault', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'inRecoveryMode',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'addedValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'increaseAllowance',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isExemptFromYieldProtocolFee',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'contract IERC20', type: 'address' }],
    name: 'isTokenExemptFromYieldProtocolFee',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'balances', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'lastChangeBlock', internalType: 'uint256', type: 'uint256' },
      {
        name: 'protocolSwapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onExitPool',
    outputs: [
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'balances', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'lastChangeBlock', internalType: 'uint256', type: 'uint256' },
      {
        name: 'protocolSwapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onJoinPool',
    outputs: [
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'swapRequest',
        internalType: 'struct IPoolSwapStructs.SwapRequest',
        type: 'tuple',
        components: [
          { name: 'kind', internalType: 'enum IVault.SwapKind', type: 'uint8' },
          { name: 'tokenIn', internalType: 'contract IERC20', type: 'address' },
          {
            name: 'tokenOut',
            internalType: 'contract IERC20',
            type: 'address',
          },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
          { name: 'lastChangeBlock', internalType: 'uint256', type: 'uint256' },
          { name: 'from', internalType: 'address', type: 'address' },
          { name: 'to', internalType: 'address', type: 'address' },
          { name: 'userData', internalType: 'bytes', type: 'bytes' },
        ],
      },
      { name: 'balances', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'indexIn', internalType: 'uint256', type: 'uint256' },
      { name: 'indexOut', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'onSwap',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'balances', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'lastChangeBlock', internalType: 'uint256', type: 'uint256' },
      {
        name: 'protocolSwapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'queryExit',
    outputs: [
      { name: 'bptIn', internalType: 'uint256', type: 'uint256' },
      { name: 'amountsOut', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'balances', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'lastChangeBlock', internalType: 'uint256', type: 'uint256' },
      {
        name: 'protocolSwapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'queryJoin',
    outputs: [
      { name: 'bptOut', internalType: 'uint256', type: 'uint256' },
      { name: 'amountsIn', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'contract IERC20', type: 'address' },
      { name: 'poolConfig', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'setAssetManagerPoolConfig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'swapFeePercentage', internalType: 'uint256', type: 'uint256' }],
    name: 'setSwapFeePercentage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'contract IERC20', type: 'address' },
      { name: 'duration', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setTokenRateCacheDuration',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'rawEndValue', internalType: 'uint256', type: 'uint256' },
      { name: 'endTime', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'startAmplificationParameterUpdate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'stopAmplificationParameterUpdate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'updateProtocolFeePercentageCache',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'contract IERC20', type: 'address' }],
    name: 'updateTokenRateCache',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'version',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
] as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xdacf5fa19b1f720111609043ac67a9818262850c)
 */
export const balancerV2ComposableStablePoolV5Address = {
  1: '0xDACf5Fa19b1f720111609043ac67A9818262850c',
} as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xdacf5fa19b1f720111609043ac67a9818262850c)
 */
export const balancerV2ComposableStablePoolV5Config = {
  address: balancerV2ComposableStablePoolV5Address,
  abi: balancerV2ComposableStablePoolV5Abi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BalancerV2GaugeV5
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xbc02ef87f4e15ef78a571f3b2adcc726fee70d8b)
 */
export const balancerV2GaugeV5Abi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'provider', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'provider', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Withdraw',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'original_balance', type: 'uint256', indexed: false },
      { name: 'original_supply', type: 'uint256', indexed: false },
      { name: 'working_balance', type: 'uint256', indexed: false },
      { name: 'working_supply', type: 'uint256', indexed: false },
    ],
    name: 'UpdateLiquidityLimit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '_from', type: 'address', indexed: true },
      { name: '_to', type: 'address', indexed: true },
      { name: '_value', type: 'uint256', indexed: false },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '_owner', type: 'address', indexed: true },
      { name: '_spender', type: 'address', indexed: true },
      { name: '_value', type: 'uint256', indexed: false },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'reward_token', type: 'address', indexed: true },
      { name: 'distributor', type: 'address', indexed: false },
    ],
    name: 'RewardDistributorUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'new_relative_weight_cap', type: 'uint256', indexed: false }],
    name: 'RelativeWeightCapChanged',
  },
  {
    type: 'constructor',
    inputs: [
      { name: 'minter', type: 'address' },
      { name: 'veBoostProxy', type: 'address' },
      { name: 'authorizerAdaptor', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_value', type: 'uint256' }],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_value', type: 'uint256' },
      { name: '_addr', type: 'address' },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_value', type: 'uint256' },
      { name: '_addr', type: 'address' },
      { name: '_claim_rewards', type: 'bool' },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_value', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_value', type: 'uint256' },
      { name: '_claim_rewards', type: 'bool' },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claim_rewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_addr', type: 'address' }],
    name: 'claim_rewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_addr', type: 'address' },
      { name: '_receiver', type: 'address' },
    ],
    name: 'claim_rewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_from', type: 'address' },
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
      { name: '_deadline', type: 'uint256' },
      { name: '_v', type: 'uint8' },
      { name: '_r', type: 'bytes32' },
      { name: '_s', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_added_value', type: 'uint256' },
    ],
    name: 'increaseAllowance',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_subtracted_value', type: 'uint256' },
    ],
    name: 'decreaseAllowance',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'addr', type: 'address' }],
    name: 'user_checkpoint',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_receiver', type: 'address' }],
    name: 'set_rewards_receiver',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'addr', type: 'address' }],
    name: 'kick',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_reward_token', type: 'address' },
      { name: '_amount', type: 'uint256' },
    ],
    name: 'deposit_reward_token',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_reward_token', type: 'address' },
      { name: '_distributor', type: 'address' },
    ],
    name: 'add_reward',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_reward_token', type: 'address' },
      { name: '_distributor', type: 'address' },
    ],
    name: 'set_reward_distributor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'killGauge',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unkillGauge',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_addr', type: 'address' },
      { name: '_token', type: 'address' },
    ],
    name: 'claimed_reward',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_user', type: 'address' },
      { name: '_reward_token', type: 'address' },
    ],
    name: 'claimable_reward',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'addr', type: 'address' }],
    name: 'claimable_tokens',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'integrate_checkpoint',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'future_epoch_time',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'inflation_rate',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'version',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_lp_token', type: 'address' },
      { name: 'relative_weight_cap', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'relative_weight_cap', type: 'uint256' }],
    name: 'setRelativeWeightCap',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getRelativeWeightCap',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'time', type: 'uint256' }],
    name: 'getCappedRelativeWeight',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getMaxRelativeWeightCap',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'arg0', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'arg0', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lp_token',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'is_killed',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'reward_count',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'arg0', type: 'address' }],
    name: 'reward_data',
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'token', type: 'address' },
          { name: 'distributor', type: 'address' },
          { name: 'period_finish', type: 'uint256' },
          { name: 'rate', type: 'uint256' },
          { name: 'last_update', type: 'uint256' },
          { name: 'integral', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'arg0', type: 'address' }],
    name: 'rewards_receiver',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'arg0', type: 'address' },
      { name: 'arg1', type: 'address' },
    ],
    name: 'reward_integral_for',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'arg0', type: 'address' }],
    name: 'working_balances',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'working_supply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'arg0', type: 'address' }],
    name: 'integrate_inv_supply_of',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'arg0', type: 'address' }],
    name: 'integrate_checkpoint_of',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'arg0', type: 'address' }],
    name: 'integrate_fraction',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'period',
    outputs: [{ name: '', type: 'int128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'arg0', type: 'uint256' }],
    name: 'reward_tokens',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'arg0', type: 'uint256' }],
    name: 'period_timestamp',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'arg0', type: 'uint256' }],
    name: 'integrate_inv_supply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xbc02ef87f4e15ef78a571f3b2adcc726fee70d8b)
 */
export const balancerV2GaugeV5Address = {
  1: '0xBC02eF87f4E15EF78A571f3B2aDcC726Fee70d8b',
} as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xbc02ef87f4e15ef78a571f3b2adcc726fee70d8b)
 */
export const balancerV2GaugeV5Config = {
  address: balancerV2GaugeV5Address,
  abi: balancerV2GaugeV5Abi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BalancerV2Vault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xBA12222222228d8Ba445958a75a0704d566BF2C8)
 */
export const balancerV2VaultAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'authorizer',
        internalType: 'contract IAuthorizer',
        type: 'address',
      },
      { name: 'weth', internalType: 'contract IWETH', type: 'address' },
      { name: 'pauseWindowDuration', internalType: 'uint256', type: 'uint256' },
      {
        name: 'bufferPeriodDuration',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newAuthorizer',
        internalType: 'contract IAuthorizer',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'AuthorizerChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'contract IERC20',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'recipient',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ExternalBalanceTransfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'recipient',
        internalType: 'contract IFlashLoanRecipient',
        type: 'address',
        indexed: true,
      },
      {
        name: 'token',
        internalType: 'contract IERC20',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'feeAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FlashLoan',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'token',
        internalType: 'contract IERC20',
        type: 'address',
        indexed: true,
      },
      { name: 'delta', internalType: 'int256', type: 'int256', indexed: false },
    ],
    name: 'InternalBalanceChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'paused', internalType: 'bool', type: 'bool', indexed: false }],
    name: 'PausedStateChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'liquidityProvider',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokens',
        internalType: 'contract IERC20[]',
        type: 'address[]',
        indexed: false,
      },
      {
        name: 'deltas',
        internalType: 'int256[]',
        type: 'int256[]',
        indexed: false,
      },
      {
        name: 'protocolFeeAmounts',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'PoolBalanceChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'assetManager',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'token',
        internalType: 'contract IERC20',
        type: 'address',
        indexed: true,
      },
      {
        name: 'cashDelta',
        internalType: 'int256',
        type: 'int256',
        indexed: false,
      },
      {
        name: 'managedDelta',
        internalType: 'int256',
        type: 'int256',
        indexed: false,
      },
    ],
    name: 'PoolBalanceManaged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'poolAddress',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'specialization',
        internalType: 'enum IVault.PoolSpecialization',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'PoolRegistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'relayer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'RelayerApprovalChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'tokenIn',
        internalType: 'contract IERC20',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenOut',
        internalType: 'contract IERC20',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amountIn',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amountOut',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Swap',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'tokens',
        internalType: 'contract IERC20[]',
        type: 'address[]',
        indexed: false,
      },
    ],
    name: 'TokensDeregistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'tokens',
        internalType: 'contract IERC20[]',
        type: 'address[]',
        indexed: false,
      },
      {
        name: 'assetManagers',
        internalType: 'address[]',
        type: 'address[]',
        indexed: false,
      },
    ],
    name: 'TokensRegistered',
  },
  {
    type: 'function',
    inputs: [],
    name: 'WETH',
    outputs: [{ name: '', internalType: 'contract IWETH', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'kind', internalType: 'enum IVault.SwapKind', type: 'uint8' },
      {
        name: 'swaps',
        internalType: 'struct IVault.BatchSwapStep[]',
        type: 'tuple[]',
        components: [
          { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
          { name: 'assetInIndex', internalType: 'uint256', type: 'uint256' },
          { name: 'assetOutIndex', internalType: 'uint256', type: 'uint256' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'userData', internalType: 'bytes', type: 'bytes' },
        ],
      },
      { name: 'assets', internalType: 'contract IAsset[]', type: 'address[]' },
      {
        name: 'funds',
        internalType: 'struct IVault.FundManagement',
        type: 'tuple',
        components: [
          { name: 'sender', internalType: 'address', type: 'address' },
          { name: 'fromInternalBalance', internalType: 'bool', type: 'bool' },
          {
            name: 'recipient',
            internalType: 'address payable',
            type: 'address',
          },
          { name: 'toInternalBalance', internalType: 'bool', type: 'bool' },
        ],
      },
      { name: 'limits', internalType: 'int256[]', type: 'int256[]' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'batchSwap',
    outputs: [{ name: 'assetDeltas', internalType: 'int256[]', type: 'int256[]' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'tokens', internalType: 'contract IERC20[]', type: 'address[]' },
    ],
    name: 'deregisterTokens',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address payable', type: 'address' },
      {
        name: 'request',
        internalType: 'struct IVault.ExitPoolRequest',
        type: 'tuple',
        components: [
          {
            name: 'assets',
            internalType: 'contract IAsset[]',
            type: 'address[]',
          },
          {
            name: 'minAmountsOut',
            internalType: 'uint256[]',
            type: 'uint256[]',
          },
          { name: 'userData', internalType: 'bytes', type: 'bytes' },
          { name: 'toInternalBalance', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    name: 'exitPool',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'recipient',
        internalType: 'contract IFlashLoanRecipient',
        type: 'address',
      },
      { name: 'tokens', internalType: 'contract IERC20[]', type: 'address[]' },
      { name: 'amounts', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'flashLoan',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'selector', internalType: 'bytes4', type: 'bytes4' }],
    name: 'getActionId',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAuthorizer',
    outputs: [{ name: '', internalType: 'contract IAuthorizer', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getDomainSeparator',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'tokens', internalType: 'contract IERC20[]', type: 'address[]' },
    ],
    name: 'getInternalBalance',
    outputs: [{ name: 'balances', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getNextNonce',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPausedState',
    outputs: [
      { name: 'paused', internalType: 'bool', type: 'bool' },
      { name: 'pauseWindowEndTime', internalType: 'uint256', type: 'uint256' },
      { name: 'bufferPeriodEndTime', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getPool',
    outputs: [
      { name: '', internalType: 'address', type: 'address' },
      {
        name: '',
        internalType: 'enum IVault.PoolSpecialization',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'token', internalType: 'contract IERC20', type: 'address' },
    ],
    name: 'getPoolTokenInfo',
    outputs: [
      { name: 'cash', internalType: 'uint256', type: 'uint256' },
      { name: 'managed', internalType: 'uint256', type: 'uint256' },
      { name: 'lastChangeBlock', internalType: 'uint256', type: 'uint256' },
      { name: 'assetManager', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getPoolTokens',
    outputs: [
      { name: 'tokens', internalType: 'contract IERC20[]', type: 'address[]' },
      { name: 'balances', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'lastChangeBlock', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getProtocolFeesCollector',
    outputs: [
      {
        name: '',
        internalType: 'contract ProtocolFeesCollector',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'relayer', internalType: 'address', type: 'address' },
    ],
    name: 'hasApprovedRelayer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      {
        name: 'request',
        internalType: 'struct IVault.JoinPoolRequest',
        type: 'tuple',
        components: [
          {
            name: 'assets',
            internalType: 'contract IAsset[]',
            type: 'address[]',
          },
          {
            name: 'maxAmountsIn',
            internalType: 'uint256[]',
            type: 'uint256[]',
          },
          { name: 'userData', internalType: 'bytes', type: 'bytes' },
          { name: 'fromInternalBalance', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    name: 'joinPool',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'ops',
        internalType: 'struct IVault.PoolBalanceOp[]',
        type: 'tuple[]',
        components: [
          {
            name: 'kind',
            internalType: 'enum IVault.PoolBalanceOpKind',
            type: 'uint8',
          },
          { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
          { name: 'token', internalType: 'contract IERC20', type: 'address' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'managePoolBalance',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'ops',
        internalType: 'struct IVault.UserBalanceOp[]',
        type: 'tuple[]',
        components: [
          {
            name: 'kind',
            internalType: 'enum IVault.UserBalanceOpKind',
            type: 'uint8',
          },
          { name: 'asset', internalType: 'contract IAsset', type: 'address' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'sender', internalType: 'address', type: 'address' },
          {
            name: 'recipient',
            internalType: 'address payable',
            type: 'address',
          },
        ],
      },
    ],
    name: 'manageUserBalance',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'kind', internalType: 'enum IVault.SwapKind', type: 'uint8' },
      {
        name: 'swaps',
        internalType: 'struct IVault.BatchSwapStep[]',
        type: 'tuple[]',
        components: [
          { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
          { name: 'assetInIndex', internalType: 'uint256', type: 'uint256' },
          { name: 'assetOutIndex', internalType: 'uint256', type: 'uint256' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'userData', internalType: 'bytes', type: 'bytes' },
        ],
      },
      { name: 'assets', internalType: 'contract IAsset[]', type: 'address[]' },
      {
        name: 'funds',
        internalType: 'struct IVault.FundManagement',
        type: 'tuple',
        components: [
          { name: 'sender', internalType: 'address', type: 'address' },
          { name: 'fromInternalBalance', internalType: 'bool', type: 'bool' },
          {
            name: 'recipient',
            internalType: 'address payable',
            type: 'address',
          },
          { name: 'toInternalBalance', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    name: 'queryBatchSwap',
    outputs: [{ name: '', internalType: 'int256[]', type: 'int256[]' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'specialization',
        internalType: 'enum IVault.PoolSpecialization',
        type: 'uint8',
      },
    ],
    name: 'registerPool',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'tokens', internalType: 'contract IERC20[]', type: 'address[]' },
      { name: 'assetManagers', internalType: 'address[]', type: 'address[]' },
    ],
    name: 'registerTokens',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'newAuthorizer',
        internalType: 'contract IAuthorizer',
        type: 'address',
      },
    ],
    name: 'setAuthorizer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'paused', internalType: 'bool', type: 'bool' }],
    name: 'setPaused',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'relayer', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setRelayerApproval',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'singleSwap',
        internalType: 'struct IVault.SingleSwap',
        type: 'tuple',
        components: [
          { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
          { name: 'kind', internalType: 'enum IVault.SwapKind', type: 'uint8' },
          { name: 'assetIn', internalType: 'contract IAsset', type: 'address' },
          {
            name: 'assetOut',
            internalType: 'contract IAsset',
            type: 'address',
          },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'userData', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: 'funds',
        internalType: 'struct IVault.FundManagement',
        type: 'tuple',
        components: [
          { name: 'sender', internalType: 'address', type: 'address' },
          { name: 'fromInternalBalance', internalType: 'bool', type: 'bool' },
          {
            name: 'recipient',
            internalType: 'address payable',
            type: 'address',
          },
          { name: 'toInternalBalance', internalType: 'bool', type: 'bool' },
        ],
      },
      { name: 'limit', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'swap',
    outputs: [{ name: 'amountCalculated', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xBA12222222228d8Ba445958a75a0704d566BF2C8)
 */
export const balancerV2VaultAddress = {
  1: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
} as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xBA12222222228d8Ba445958a75a0704d566BF2C8)
 */
export const balancerV2VaultConfig = {
  address: balancerV2VaultAddress,
  abi: balancerV2VaultAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BalancerV2WeightedPoolV4
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x3ff3a210e57cfe679d9ad1e9ba6453a716c56a2e)
 */
export const balancerV2WeightedPoolV4Abi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'params',
        internalType: 'struct WeightedPool.NewPoolParams',
        type: 'tuple',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'symbol', internalType: 'string', type: 'string' },
          {
            name: 'tokens',
            internalType: 'contract IERC20[]',
            type: 'address[]',
          },
          {
            name: 'normalizedWeights',
            internalType: 'uint256[]',
            type: 'uint256[]',
          },
          {
            name: 'rateProviders',
            internalType: 'contract IRateProvider[]',
            type: 'address[]',
          },
          {
            name: 'assetManagers',
            internalType: 'address[]',
            type: 'address[]',
          },
          {
            name: 'swapFeePercentage',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
      },
      { name: 'vault', internalType: 'contract IVault', type: 'address' },
      {
        name: 'protocolFeeProvider',
        internalType: 'contract IProtocolFeePercentagesProvider',
        type: 'address',
      },
      { name: 'pauseWindowDuration', internalType: 'uint256', type: 'uint256' },
      {
        name: 'bufferPeriodDuration',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'version', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'paused', internalType: 'bool', type: 'bool', indexed: false }],
    name: 'PausedStateChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'feeType',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'protocolFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ProtocolFeePercentageCacheUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'enabled', internalType: 'bool', type: 'bool', indexed: false }],
    name: 'RecoveryModeStateChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'swapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SwapFeePercentageChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DELEGATE_PROTOCOL_SWAP_FEES_SENTINEL',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'decreaseAllowance',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'disableRecoveryMode',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'enableRecoveryMode',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getATHRateProduct',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'selector', internalType: 'bytes4', type: 'bytes4' }],
    name: 'getActionId',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getActualSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAuthorizer',
    outputs: [{ name: '', internalType: 'contract IAuthorizer', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getDomainSeparator',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getInvariant',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getLastPostJoinExitInvariant',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'getNextNonce',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getNormalizedWeights',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPausedState',
    outputs: [
      { name: 'paused', internalType: 'bool', type: 'bool' },
      { name: 'pauseWindowEndTime', internalType: 'uint256', type: 'uint256' },
      { name: 'bufferPeriodEndTime', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPoolId',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'feeType', internalType: 'uint256', type: 'uint256' }],
    name: 'getProtocolFeePercentageCache',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getProtocolFeesCollector',
    outputs: [
      {
        name: '',
        internalType: 'contract IProtocolFeesCollector',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getProtocolSwapFeeDelegation',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getRateProviders',
    outputs: [{ name: '', internalType: 'contract IRateProvider[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getScalingFactors',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getSwapFeePercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getVault',
    outputs: [{ name: '', internalType: 'contract IVault', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'inRecoveryMode',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'addedValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'increaseAllowance',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'balances', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'lastChangeBlock', internalType: 'uint256', type: 'uint256' },
      {
        name: 'protocolSwapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onExitPool',
    outputs: [
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'balances', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'lastChangeBlock', internalType: 'uint256', type: 'uint256' },
      {
        name: 'protocolSwapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onJoinPool',
    outputs: [
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'request',
        internalType: 'struct IPoolSwapStructs.SwapRequest',
        type: 'tuple',
        components: [
          { name: 'kind', internalType: 'enum IVault.SwapKind', type: 'uint8' },
          { name: 'tokenIn', internalType: 'contract IERC20', type: 'address' },
          {
            name: 'tokenOut',
            internalType: 'contract IERC20',
            type: 'address',
          },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
          { name: 'lastChangeBlock', internalType: 'uint256', type: 'uint256' },
          { name: 'from', internalType: 'address', type: 'address' },
          { name: 'to', internalType: 'address', type: 'address' },
          { name: 'userData', internalType: 'bytes', type: 'bytes' },
        ],
      },
      { name: 'balanceTokenIn', internalType: 'uint256', type: 'uint256' },
      { name: 'balanceTokenOut', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'onSwap',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'balances', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'lastChangeBlock', internalType: 'uint256', type: 'uint256' },
      {
        name: 'protocolSwapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'queryExit',
    outputs: [
      { name: 'bptIn', internalType: 'uint256', type: 'uint256' },
      { name: 'amountsOut', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'balances', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'lastChangeBlock', internalType: 'uint256', type: 'uint256' },
      {
        name: 'protocolSwapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'queryJoin',
    outputs: [
      { name: 'bptOut', internalType: 'uint256', type: 'uint256' },
      { name: 'amountsIn', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'contract IERC20', type: 'address' },
      { name: 'poolConfig', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'setAssetManagerPoolConfig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'swapFeePercentage', internalType: 'uint256', type: 'uint256' }],
    name: 'setSwapFeePercentage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'updateProtocolFeePercentageCache',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'version',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
] as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x3ff3a210e57cfe679d9ad1e9ba6453a716c56a2e)
 */
export const balancerV2WeightedPoolV4Address = {
  1: '0x3ff3a210e57cFe679D9AD1e9bA6453A716C56a2e',
} as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x3ff3a210e57cfe679d9ad1e9ba6453a716c56a2e)
 */
export const balancerV2WeightedPoolV4Config = {
  address: balancerV2WeightedPoolV4Address,
  abi: balancerV2WeightedPoolV4Abi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GyroECLPPool
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2191Df821C198600499aA1f0031b1a7514D7A7D9)
 */
export const gyroEclpPoolAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'params',
        internalType: 'struct GyroECLPPool.GyroParams',
        type: 'tuple',
        components: [
          {
            name: 'baseParams',
            internalType: 'struct ExtensibleWeightedPool2Tokens.NewPoolParams',
            type: 'tuple',
            components: [
              {
                name: 'vault',
                internalType: 'contract IVault',
                type: 'address',
              },
              { name: 'name', internalType: 'string', type: 'string' },
              { name: 'symbol', internalType: 'string', type: 'string' },
              {
                name: 'token0',
                internalType: 'contract IERC20',
                type: 'address',
              },
              {
                name: 'token1',
                internalType: 'contract IERC20',
                type: 'address',
              },
              {
                name: 'swapFeePercentage',
                internalType: 'uint256',
                type: 'uint256',
              },
              {
                name: 'pauseWindowDuration',
                internalType: 'uint256',
                type: 'uint256',
              },
              {
                name: 'bufferPeriodDuration',
                internalType: 'uint256',
                type: 'uint256',
              },
              { name: 'owner', internalType: 'address', type: 'address' },
            ],
          },
          {
            name: 'eclpParams',
            internalType: 'struct GyroECLPMath.Params',
            type: 'tuple',
            components: [
              { name: 'alpha', internalType: 'int256', type: 'int256' },
              { name: 'beta', internalType: 'int256', type: 'int256' },
              { name: 'c', internalType: 'int256', type: 'int256' },
              { name: 's', internalType: 'int256', type: 'int256' },
              { name: 'lambda', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'derivedEclpParams',
            internalType: 'struct GyroECLPMath.DerivedParams',
            type: 'tuple',
            components: [
              {
                name: 'tauAlpha',
                internalType: 'struct GyroECLPMath.Vector2',
                type: 'tuple',
                components: [
                  { name: 'x', internalType: 'int256', type: 'int256' },
                  { name: 'y', internalType: 'int256', type: 'int256' },
                ],
              },
              {
                name: 'tauBeta',
                internalType: 'struct GyroECLPMath.Vector2',
                type: 'tuple',
                components: [
                  { name: 'x', internalType: 'int256', type: 'int256' },
                  { name: 'y', internalType: 'int256', type: 'int256' },
                ],
              },
              { name: 'u', internalType: 'int256', type: 'int256' },
              { name: 'v', internalType: 'int256', type: 'int256' },
              { name: 'w', internalType: 'int256', type: 'int256' },
              { name: 'z', internalType: 'int256', type: 'int256' },
              { name: 'dSq', internalType: 'int256', type: 'int256' },
            ],
          },
          { name: 'rateProvider0', internalType: 'address', type: 'address' },
          { name: 'rateProvider1', internalType: 'address', type: 'address' },
          { name: 'capManager', internalType: 'address', type: 'address' },
          {
            name: 'capParams',
            internalType: 'struct ICappedLiquidity.CapParams',
            type: 'tuple',
            components: [
              { name: 'capEnabled', internalType: 'bool', type: 'bool' },
              {
                name: 'perAddressCap',
                internalType: 'uint120',
                type: 'uint120',
              },
              { name: 'globalCap', internalType: 'uint128', type: 'uint128' },
            ],
          },
          { name: 'pauseManager', internalType: 'address', type: 'address' },
        ],
      },
      { name: 'configAddress', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'capManager',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'CapManagerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'params',
        internalType: 'struct ICappedLiquidity.CapParams',
        type: 'tuple',
        components: [
          { name: 'capEnabled', internalType: 'bool', type: 'bool' },
          { name: 'perAddressCap', internalType: 'uint120', type: 'uint120' },
          { name: 'globalCap', internalType: 'uint128', type: 'uint128' },
        ],
        indexed: false,
      },
    ],
    name: 'CapParamsUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'derivedParamsValidated',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
    ],
    name: 'ECLPDerivedParamsValidated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'paramsValidated',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
    ],
    name: 'ECLPParamsValidated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'invariantAfterJoin',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'InvariantAterInitializeJoin',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldInvariant',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newInvariant',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'InvariantOldAndNew',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldPauseManager',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newPauseManager',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'PauseManagerChanged',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'PausedLocally' },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'paused', internalType: 'bool', type: 'bool', indexed: false }],
    name: 'PausedStateChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'swapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SwapFeePercentageChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'balances',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'invariant',
        internalType: 'struct GyroECLPMath.Vector2',
        type: 'tuple',
        components: [
          { name: 'x', internalType: 'int256', type: 'int256' },
          { name: 'y', internalType: 'int256', type: 'int256' },
        ],
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SwapParams',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'UnpausedLocally' },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'capManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'capParams',
    outputs: [
      {
        name: '',
        internalType: 'struct ICappedLiquidity.CapParams',
        type: 'tuple',
        components: [
          { name: 'capEnabled', internalType: 'bool', type: 'bool' },
          { name: 'perAddressCap', internalType: 'uint120', type: 'uint120' },
          { name: 'globalCap', internalType: 'uint128', type: 'uint128' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_pauseManager', internalType: 'address', type: 'address' }],
    name: 'changePauseManager',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'decreaseAllowance',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'selector', internalType: 'bytes4', type: 'bytes4' }],
    name: 'getActionId',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getActualSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAuthorizer',
    outputs: [{ name: '', internalType: 'contract IAuthorizer', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getECLPParams',
    outputs: [
      {
        name: 'params',
        internalType: 'struct GyroECLPMath.Params',
        type: 'tuple',
        components: [
          { name: 'alpha', internalType: 'int256', type: 'int256' },
          { name: 'beta', internalType: 'int256', type: 'int256' },
          { name: 'c', internalType: 'int256', type: 'int256' },
          { name: 's', internalType: 'int256', type: 'int256' },
          { name: 'lambda', internalType: 'int256', type: 'int256' },
        ],
      },
      {
        name: 'd',
        internalType: 'struct GyroECLPMath.DerivedParams',
        type: 'tuple',
        components: [
          {
            name: 'tauAlpha',
            internalType: 'struct GyroECLPMath.Vector2',
            type: 'tuple',
            components: [
              { name: 'x', internalType: 'int256', type: 'int256' },
              { name: 'y', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'tauBeta',
            internalType: 'struct GyroECLPMath.Vector2',
            type: 'tuple',
            components: [
              { name: 'x', internalType: 'int256', type: 'int256' },
              { name: 'y', internalType: 'int256', type: 'int256' },
            ],
          },
          { name: 'u', internalType: 'int256', type: 'int256' },
          { name: 'v', internalType: 'int256', type: 'int256' },
          { name: 'w', internalType: 'int256', type: 'int256' },
          { name: 'z', internalType: 'int256', type: 'int256' },
          { name: 'dSq', internalType: 'int256', type: 'int256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getFeesMetadata',
    outputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getInvariant',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getInvariantDivActualSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getLastInvariant',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getMiscData',
    outputs: [
      { name: 'logInvariant', internalType: 'int256', type: 'int256' },
      { name: 'logTotalSupply', internalType: 'int256', type: 'int256' },
      {
        name: 'oracleSampleCreationTimestamp',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'oracleIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'oracleEnabled', internalType: 'bool', type: 'bool' },
      { name: 'swapFeePercentage', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getNormalizedWeights',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPausedState',
    outputs: [
      { name: 'paused', internalType: 'bool', type: 'bool' },
      { name: 'pauseWindowEndTime', internalType: 'uint256', type: 'uint256' },
      { name: 'bufferPeriodEndTime', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPoolId',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPrice',
    outputs: [{ name: 'spotPrice', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getRate',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getSwapFeePercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTokenRates',
    outputs: [
      { name: 'rate0', internalType: 'uint256', type: 'uint256' },
      { name: 'rate1', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getVault',
    outputs: [{ name: '', internalType: 'contract IVault', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gyroConfig',
    outputs: [{ name: '', internalType: 'contract IGyroConfig', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'addedValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'increaseAllowance',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'balances', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'lastChangeBlock', internalType: 'uint256', type: 'uint256' },
      {
        name: 'protocolSwapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onExitPool',
    outputs: [
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'balances', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'lastChangeBlock', internalType: 'uint256', type: 'uint256' },
      {
        name: 'protocolSwapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onJoinPool',
    outputs: [
      { name: 'amountsIn', internalType: 'uint256[]', type: 'uint256[]' },
      {
        name: 'dueProtocolFeeAmounts',
        internalType: 'uint256[]',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'request',
        internalType: 'struct IPoolSwapStructs.SwapRequest',
        type: 'tuple',
        components: [
          { name: 'kind', internalType: 'enum IVault.SwapKind', type: 'uint8' },
          { name: 'tokenIn', internalType: 'contract IERC20', type: 'address' },
          {
            name: 'tokenOut',
            internalType: 'contract IERC20',
            type: 'address',
          },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
          { name: 'lastChangeBlock', internalType: 'uint256', type: 'uint256' },
          { name: 'from', internalType: 'address', type: 'address' },
          { name: 'to', internalType: 'address', type: 'address' },
          { name: 'userData', internalType: 'bytes', type: 'bytes' },
        ],
      },
      { name: 'balanceTokenIn', internalType: 'uint256', type: 'uint256' },
      { name: 'balanceTokenOut', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'onSwap',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pauseManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'balances', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'lastChangeBlock', internalType: 'uint256', type: 'uint256' },
      {
        name: 'protocolSwapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'queryExit',
    outputs: [
      { name: 'bptIn', internalType: 'uint256', type: 'uint256' },
      { name: 'amountsOut', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'balances', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'lastChangeBlock', internalType: 'uint256', type: 'uint256' },
      {
        name: 'protocolSwapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'userData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'queryJoin',
    outputs: [
      { name: 'bptOut', internalType: 'uint256', type: 'uint256' },
      { name: 'amountsIn', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rateProvider0',
    outputs: [{ name: '', internalType: 'contract IRateProvider', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rateProvider1',
    outputs: [{ name: '', internalType: 'contract IRateProvider', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_capManager', internalType: 'address', type: 'address' }],
    name: 'setCapManager',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct ICappedLiquidity.CapParams',
        type: 'tuple',
        components: [
          { name: 'capEnabled', internalType: 'bool', type: 'bool' },
          { name: 'perAddressCap', internalType: 'uint120', type: 'uint120' },
          { name: 'globalCap', internalType: 'uint128', type: 'uint128' },
        ],
      },
    ],
    name: 'setCapParams',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'paused', internalType: 'bool', type: 'bool' }],
    name: 'setPaused',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'swapFeePercentage', internalType: 'uint256', type: 'uint256' }],
    name: 'setSwapFeePercentage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2191Df821C198600499aA1f0031b1a7514D7A7D9)
 */
export const gyroEclpPoolAddress = {
  1: '0x2191Df821C198600499aA1f0031b1a7514D7A7D9',
} as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x2191Df821C198600499aA1f0031b1a7514D7A7D9)
 */
export const gyroEclpPoolConfig = {
  address: gyroEclpPoolAddress,
  abi: gyroEclpPoolAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VaultAdmin
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x35fFB749B273bEb20F40f35EdeB805012C539864)
 */
export const vaultAdminAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'mainVault', internalType: 'contract IVault', type: 'address' },
      { name: 'pauseWindowDuration', internalType: 'uint32', type: 'uint32' },
      { name: 'bufferPeriodDuration', internalType: 'uint32', type: 'uint32' },
      { name: 'minTradeAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'minWrapAmount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AfterAddLiquidityHookFailed' },
  { type: 'error', inputs: [], name: 'AfterInitializeHookFailed' },
  { type: 'error', inputs: [], name: 'AfterRemoveLiquidityHookFailed' },
  { type: 'error', inputs: [], name: 'AfterSwapHookFailed' },
  { type: 'error', inputs: [], name: 'AmountGivenZero' },
  {
    type: 'error',
    inputs: [
      { name: 'tokenIn', internalType: 'contract IERC20', type: 'address' },
      { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
      { name: 'maxAmountIn', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'AmountInAboveMax',
  },
  {
    type: 'error',
    inputs: [
      { name: 'tokenOut', internalType: 'contract IERC20', type: 'address' },
      { name: 'amountOut', internalType: 'uint256', type: 'uint256' },
      { name: 'minAmountOut', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'AmountOutBelowMin',
  },
  { type: 'error', inputs: [], name: 'BalanceNotSettled' },
  { type: 'error', inputs: [], name: 'BalanceOverflow' },
  { type: 'error', inputs: [], name: 'BeforeAddLiquidityHookFailed' },
  { type: 'error', inputs: [], name: 'BeforeInitializeHookFailed' },
  { type: 'error', inputs: [], name: 'BeforeRemoveLiquidityHookFailed' },
  { type: 'error', inputs: [], name: 'BeforeSwapHookFailed' },
  {
    type: 'error',
    inputs: [
      { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
      { name: 'maxAmountIn', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'BptAmountInAboveMax',
  },
  {
    type: 'error',
    inputs: [
      { name: 'amountOut', internalType: 'uint256', type: 'uint256' },
      { name: 'minAmountOut', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'BptAmountOutBelowMin',
  },
  {
    type: 'error',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
      },
    ],
    name: 'BufferAlreadyInitialized',
  },
  {
    type: 'error',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
      },
    ],
    name: 'BufferNotInitialized',
  },
  { type: 'error', inputs: [], name: 'BufferSharesInvalidOwner' },
  { type: 'error', inputs: [], name: 'BufferSharesInvalidReceiver' },
  {
    type: 'error',
    inputs: [{ name: 'totalSupply', internalType: 'uint256', type: 'uint256' }],
    name: 'BufferTotalSupplyTooLow',
  },
  { type: 'error', inputs: [], name: 'CannotReceiveEth' },
  { type: 'error', inputs: [], name: 'CannotSwapSameToken' },
  { type: 'error', inputs: [], name: 'CodecOverflow' },
  { type: 'error', inputs: [], name: 'DoesNotSupportAddLiquidityCustom' },
  { type: 'error', inputs: [], name: 'DoesNotSupportDonation' },
  { type: 'error', inputs: [], name: 'DoesNotSupportRemoveLiquidityCustom' },
  { type: 'error', inputs: [], name: 'DoesNotSupportUnbalancedLiquidity' },
  { type: 'error', inputs: [], name: 'DynamicSwapFeeHookFailed' },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  { type: 'error', inputs: [], name: 'FeePrecisionTooHigh' },
  {
    type: 'error',
    inputs: [
      { name: 'tokenIn', internalType: 'contract IERC20', type: 'address' },
      { name: 'amountIn', internalType: 'uint256', type: 'uint256' },
      { name: 'maxAmountIn', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'HookAdjustedAmountInAboveMax',
  },
  {
    type: 'error',
    inputs: [
      { name: 'tokenOut', internalType: 'contract IERC20', type: 'address' },
      { name: 'amountOut', internalType: 'uint256', type: 'uint256' },
      { name: 'minAmountOut', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'HookAdjustedAmountOutBelowMin',
  },
  {
    type: 'error',
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'limit', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'HookAdjustedSwapLimit',
  },
  {
    type: 'error',
    inputs: [
      { name: 'poolHooksContract', internalType: 'address', type: 'address' },
      { name: 'pool', internalType: 'address', type: 'address' },
      { name: 'poolFactory', internalType: 'address', type: 'address' },
    ],
    name: 'HookRegistrationFailed',
  },
  { type: 'error', inputs: [], name: 'InvalidAddLiquidityKind' },
  { type: 'error', inputs: [], name: 'InvalidRemoveLiquidityKind' },
  { type: 'error', inputs: [], name: 'InvalidToken' },
  { type: 'error', inputs: [], name: 'InvalidTokenConfiguration' },
  { type: 'error', inputs: [], name: 'InvalidTokenDecimals' },
  { type: 'error', inputs: [], name: 'InvalidTokenType' },
  {
    type: 'error',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
      },
    ],
    name: 'InvalidUnderlyingToken',
  },
  {
    type: 'error',
    inputs: [
      { name: 'issuedShares', internalType: 'uint256', type: 'uint256' },
      { name: 'minIssuedShares', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'IssuedSharesBelowMin',
  },
  { type: 'error', inputs: [], name: 'MaxTokens' },
  { type: 'error', inputs: [], name: 'MinTokens' },
  { type: 'error', inputs: [], name: 'NotEnoughBufferShares' },
  {
    type: 'error',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
      },
      {
        name: 'expectedUnderlyingAmount',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'actualUnderlyingAmount',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    name: 'NotEnoughUnderlying',
  },
  {
    type: 'error',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
      },
      {
        name: 'expectedWrappedAmount',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'actualWrappedAmount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'NotEnoughWrapped',
  },
  { type: 'error', inputs: [], name: 'NotStaticCall' },
  { type: 'error', inputs: [], name: 'NotVaultDelegateCall' },
  { type: 'error', inputs: [], name: 'OutOfBounds' },
  { type: 'error', inputs: [], name: 'PauseBufferPeriodDurationTooLarge' },
  { type: 'error', inputs: [], name: 'PercentageAboveMax' },
  {
    type: 'error',
    inputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    name: 'PoolAlreadyInitialized',
  },
  {
    type: 'error',
    inputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    name: 'PoolAlreadyRegistered',
  },
  {
    type: 'error',
    inputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    name: 'PoolInRecoveryMode',
  },
  {
    type: 'error',
    inputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    name: 'PoolNotInRecoveryMode',
  },
  {
    type: 'error',
    inputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    name: 'PoolNotInitialized',
  },
  {
    type: 'error',
    inputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    name: 'PoolNotPaused',
  },
  {
    type: 'error',
    inputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    name: 'PoolNotRegistered',
  },
  {
    type: 'error',
    inputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    name: 'PoolPauseWindowExpired',
  },
  {
    type: 'error',
    inputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    name: 'PoolPaused',
  },
  {
    type: 'error',
    inputs: [{ name: 'totalSupply', internalType: 'uint256', type: 'uint256' }],
    name: 'PoolTotalSupplyTooLow',
  },
  { type: 'error', inputs: [], name: 'ProtocolFeesExceedTotalCollected' },
  { type: 'error', inputs: [], name: 'QueriesDisabled' },
  { type: 'error', inputs: [], name: 'QueriesDisabledPermanently' },
  { type: 'error', inputs: [], name: 'QuoteResultSpoofed' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  { type: 'error', inputs: [], name: 'RouterNotTrusted' },
  {
    type: 'error',
    inputs: [
      { name: 'bits', internalType: 'uint8', type: 'uint8' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'SafeCastOverflowedUintDowncast',
  },
  {
    type: 'error',
    inputs: [{ name: 'value', internalType: 'uint256', type: 'uint256' }],
    name: 'SafeCastOverflowedUintToInt',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'SenderIsNotVault',
  },
  { type: 'error', inputs: [], name: 'SenderNotAllowed' },
  { type: 'error', inputs: [], name: 'SwapFeePercentageTooHigh' },
  { type: 'error', inputs: [], name: 'SwapFeePercentageTooLow' },
  {
    type: 'error',
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'limit', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'SwapLimit',
  },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'contract IERC20', type: 'address' }],
    name: 'TokenAlreadyRegistered',
  },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'contract IERC20', type: 'address' }],
    name: 'TokenNotRegistered',
  },
  {
    type: 'error',
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address' },
      { name: 'expectedToken', internalType: 'address', type: 'address' },
      { name: 'actualToken', internalType: 'address', type: 'address' },
    ],
    name: 'TokensMismatch',
  },
  { type: 'error', inputs: [], name: 'TradeAmountTooSmall' },
  { type: 'error', inputs: [], name: 'VaultBuffersArePaused' },
  { type: 'error', inputs: [], name: 'VaultIsNotUnlocked' },
  { type: 'error', inputs: [], name: 'VaultNotPaused' },
  { type: 'error', inputs: [], name: 'VaultPauseWindowDurationTooLarge' },
  { type: 'error', inputs: [], name: 'VaultPauseWindowExpired' },
  { type: 'error', inputs: [], name: 'VaultPaused' },
  {
    type: 'error',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
      },
    ],
    name: 'WrapAmountTooSmall',
  },
  { type: 'error', inputs: [], name: 'WrongProtocolFeeControllerDeployment' },
  {
    type: 'error',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
      },
      { name: 'underlyingToken', internalType: 'address', type: 'address' },
    ],
    name: 'WrongUnderlyingToken',
  },
  { type: 'error', inputs: [], name: 'WrongVaultAdminDeployment' },
  { type: 'error', inputs: [], name: 'WrongVaultExtensionDeployment' },
  { type: 'error', inputs: [], name: 'ZeroDivision' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'aggregateSwapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AggregateSwapFeePercentageChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'aggregateYieldFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AggregateYieldFeePercentageChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newAuthorizer',
        internalType: 'contract IAuthorizer',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'AuthorizerChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
        indexed: true,
      },
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'burnedShares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'BufferSharesBurned',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
        indexed: true,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'issuedShares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'BufferSharesMinted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'liquidityProvider',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'kind',
        internalType: 'enum AddLiquidityKind',
        type: 'uint8',
        indexed: true,
      },
      {
        name: 'totalSupply',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amountsAddedRaw',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'swapFeeAmountsRaw',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'LiquidityAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amountUnderlying',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amountWrapped',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bufferBalances',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'LiquidityAddedToBuffer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'liquidityProvider',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'kind',
        internalType: 'enum RemoveLiquidityKind',
        type: 'uint8',
        indexed: true,
      },
      {
        name: 'totalSupply',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amountsRemovedRaw',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'swapFeeAmountsRaw',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'LiquidityRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amountUnderlying',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amountWrapped',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bufferBalances',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'LiquidityRemovedFromBuffer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'pool', internalType: 'address', type: 'address', indexed: true }],
    name: 'PoolInitialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address', indexed: true },
      { name: 'paused', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'PoolPausedStateChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'recoveryMode',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
    ],
    name: 'PoolRecoveryModeStateChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'factory',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenConfig',
        internalType: 'struct TokenConfig[]',
        type: 'tuple[]',
        components: [
          { name: 'token', internalType: 'contract IERC20', type: 'address' },
          { name: 'tokenType', internalType: 'enum TokenType', type: 'uint8' },
          {
            name: 'rateProvider',
            internalType: 'contract IRateProvider',
            type: 'address',
          },
          { name: 'paysYieldFees', internalType: 'bool', type: 'bool' },
        ],
        indexed: false,
      },
      {
        name: 'swapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'pauseWindowEndTime',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
      {
        name: 'roleAccounts',
        internalType: 'struct PoolRoleAccounts',
        type: 'tuple',
        components: [
          { name: 'pauseManager', internalType: 'address', type: 'address' },
          { name: 'swapFeeManager', internalType: 'address', type: 'address' },
          { name: 'poolCreator', internalType: 'address', type: 'address' },
        ],
        indexed: false,
      },
      {
        name: 'hooksConfig',
        internalType: 'struct HooksConfig',
        type: 'tuple',
        components: [
          {
            name: 'enableHookAdjustedAmounts',
            internalType: 'bool',
            type: 'bool',
          },
          {
            name: 'shouldCallBeforeInitialize',
            internalType: 'bool',
            type: 'bool',
          },
          {
            name: 'shouldCallAfterInitialize',
            internalType: 'bool',
            type: 'bool',
          },
          {
            name: 'shouldCallComputeDynamicSwapFee',
            internalType: 'bool',
            type: 'bool',
          },
          { name: 'shouldCallBeforeSwap', internalType: 'bool', type: 'bool' },
          { name: 'shouldCallAfterSwap', internalType: 'bool', type: 'bool' },
          {
            name: 'shouldCallBeforeAddLiquidity',
            internalType: 'bool',
            type: 'bool',
          },
          {
            name: 'shouldCallAfterAddLiquidity',
            internalType: 'bool',
            type: 'bool',
          },
          {
            name: 'shouldCallBeforeRemoveLiquidity',
            internalType: 'bool',
            type: 'bool',
          },
          {
            name: 'shouldCallAfterRemoveLiquidity',
            internalType: 'bool',
            type: 'bool',
          },
          { name: 'hooksContract', internalType: 'address', type: 'address' },
        ],
        indexed: false,
      },
      {
        name: 'liquidityManagement',
        internalType: 'struct LiquidityManagement',
        type: 'tuple',
        components: [
          {
            name: 'disableUnbalancedLiquidity',
            internalType: 'bool',
            type: 'bool',
          },
          {
            name: 'enableAddLiquidityCustom',
            internalType: 'bool',
            type: 'bool',
          },
          {
            name: 'enableRemoveLiquidityCustom',
            internalType: 'bool',
            type: 'bool',
          },
          { name: 'enableDonation', internalType: 'bool', type: 'bool' },
        ],
        indexed: false,
      },
    ],
    name: 'PoolRegistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newProtocolFeeController',
        internalType: 'contract IProtocolFeeController',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ProtocolFeeControllerChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenIn',
        internalType: 'contract IERC20',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenOut',
        internalType: 'contract IERC20',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amountIn',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amountOut',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'swapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'swapFeeAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Swap',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'swapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SwapFeePercentageChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address', indexed: true },
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
        indexed: true,
      },
      {
        name: 'burnedShares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'withdrawnUnderlying',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bufferBalances',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'Unwrap',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'eventKey',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'eventData',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'VaultAuxiliary',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'paused', internalType: 'bool', type: 'bool', indexed: false }],
    name: 'VaultBuffersPausedStateChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'paused', internalType: 'bool', type: 'bool', indexed: false }],
    name: 'VaultPausedStateChanged',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'VaultQueriesDisabled' },
  { type: 'event', anonymous: false, inputs: [], name: 'VaultQueriesEnabled' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
        indexed: true,
      },
      {
        name: 'depositedUnderlying',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'mintedShares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bufferBalances',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'Wrap',
  },
  { type: 'fallback', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
      },
      {
        name: 'maxAmountUnderlyingInRaw',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'maxAmountWrappedInRaw',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'exactSharesToIssue', internalType: 'uint256', type: 'uint256' },
      { name: 'sharesOwner', internalType: 'address', type: 'address' },
    ],
    name: 'addLiquidityToBuffer',
    outputs: [
      { name: 'amountUnderlyingRaw', internalType: 'uint256', type: 'uint256' },
      { name: 'amountWrappedRaw', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'areBuffersPaused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    name: 'collectAggregateFees',
    outputs: [
      { name: 'totalSwapFees', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'totalYieldFees', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'disableQuery',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'disableQueryPermanently',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    name: 'disableRecoveryMode',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'enableQuery',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    name: 'enableRecoveryMode',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'selector', internalType: 'bytes4', type: 'bytes4' }],
    name: 'getActionId',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
      },
    ],
    name: 'getBufferAsset',
    outputs: [{ name: 'underlyingToken', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'contract IERC4626', type: 'address' }],
    name: 'getBufferBalance',
    outputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getBufferMinimumTotalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'contract IERC4626', type: 'address' },
      { name: 'user', internalType: 'address', type: 'address' },
    ],
    name: 'getBufferOwnerShares',
    outputs: [{ name: 'shares', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getBufferPeriodDuration',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getBufferPeriodEndTime',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'contract IERC4626', type: 'address' }],
    name: 'getBufferTotalShares',
    outputs: [{ name: 'shares', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getMaximumPoolTokens',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getMinimumPoolTokens',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getMinimumTradeAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getMinimumWrapAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPauseWindowEndTime',
    outputs: [{ name: '', internalType: 'uint32', type: 'uint32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPoolMinimumTotalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getVaultPausedState',
    outputs: [
      { name: '', internalType: 'bool', type: 'bool' },
      { name: '', internalType: 'uint32', type: 'uint32' },
      { name: '', internalType: 'uint32', type: 'uint32' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
      },
      { name: 'amountUnderlyingRaw', internalType: 'uint256', type: 'uint256' },
      { name: 'amountWrappedRaw', internalType: 'uint256', type: 'uint256' },
      { name: 'minIssuedShares', internalType: 'uint256', type: 'uint256' },
      { name: 'sharesOwner', internalType: 'address', type: 'address' },
    ],
    name: 'initializeBuffer',
    outputs: [{ name: 'issuedShares', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isVaultPaused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    name: 'pausePool',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pauseVault',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pauseVaultBuffers',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'reentrancyGuardEntered',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
      },
      { name: 'sharesToRemove', internalType: 'uint256', type: 'uint256' },
      {
        name: 'minAmountUnderlyingOutRaw',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'minAmountWrappedOutRaw',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    name: 'removeLiquidityFromBuffer',
    outputs: [
      {
        name: 'removedUnderlyingBalanceRaw',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'removedWrappedBalanceRaw',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'wrappedToken',
        internalType: 'contract IERC4626',
        type: 'address',
      },
      { name: 'sharesToRemove', internalType: 'uint256', type: 'uint256' },
      {
        name: 'minAmountUnderlyingOutRaw',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'minAmountWrappedOutRaw',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'sharesOwner', internalType: 'address', type: 'address' },
    ],
    name: 'removeLiquidityFromBufferHook',
    outputs: [
      {
        name: 'removedUnderlyingBalanceRaw',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'removedWrappedBalanceRaw',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'newAuthorizer',
        internalType: 'contract IAuthorizer',
        type: 'address',
      },
    ],
    name: 'setAuthorizer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'newProtocolFeeController',
        internalType: 'contract IProtocolFeeController',
        type: 'address',
      },
    ],
    name: 'setProtocolFeeController',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address' },
      { name: 'swapFeePercentage', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setStaticSwapFeePercentage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'pool', internalType: 'address', type: 'address' }],
    name: 'unpausePool',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpauseVault',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpauseVaultBuffers',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address' },
      {
        name: 'newAggregateSwapFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    name: 'updateAggregateSwapFeePercentage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pool', internalType: 'address', type: 'address' },
      {
        name: 'newAggregateYieldFeePercentage',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    name: 'updateAggregateYieldFeePercentage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'vault',
    outputs: [{ name: '', internalType: 'contract IVault', type: 'address' }],
    stateMutability: 'view',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x35fFB749B273bEb20F40f35EdeB805012C539864)
 */
export const vaultAdminAddress = {
  1: '0x35fFB749B273bEb20F40f35EdeB805012C539864',
} as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x35fFB749B273bEb20F40f35EdeB805012C539864)
 */
export const vaultAdminConfig = {
  address: vaultAdminAddress,
  abi: vaultAdminAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// erc20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
  {
    type: 'event',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'spender', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// feeDistributor
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xD3cf852898b21fc233251427c2DC93d3d604F3BB)
 */
export const feeDistributorAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'votingEscrow',
        internalType: 'contract IVotingEscrow',
        type: 'address',
      },
      { name: 'startTime', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'user',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      { name: 'enabled', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'OnlyCallerOptIn',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'contract IERC20',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'lastCheckpointTimestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TokenCheckpointed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'user',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'token',
        internalType: 'contract IERC20',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'userTokenTimeCursor',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TokensClaimed',
  },
  {
    type: 'function',
    inputs: [],
    name: 'checkpoint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'contract IERC20', type: 'address' }],
    name: 'checkpointToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokens', internalType: 'contract IERC20[]', type: 'address[]' }],
    name: 'checkpointTokens',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'checkpointUser',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'contract IERC20', type: 'address' },
    ],
    name: 'claimToken',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'tokens', internalType: 'contract IERC20[]', type: 'address[]' },
    ],
    name: 'claimTokens',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'contract IERC20', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'depositToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokens', internalType: 'contract IERC20[]', type: 'address[]' },
      { name: 'amounts', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'depositTokens',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getDomainSeparator',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'getNextNonce',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTimeCursor',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'contract IERC20', type: 'address' }],
    name: 'getTokenLastBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'contract IERC20', type: 'address' }],
    name: 'getTokenTimeCursor',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'contract IERC20', type: 'address' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getTokensDistributedInWeek',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'timestamp', internalType: 'uint256', type: 'uint256' }],
    name: 'getTotalSupplyAtTimestamp',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getUserBalanceAtTimestamp',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserTimeCursor',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'contract IERC20', type: 'address' },
    ],
    name: 'getUserTokenTimeCursor',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getVotingEscrow',
    outputs: [{ name: '', internalType: 'contract IVotingEscrow', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'isOnlyCallerEnabled',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'enabled', internalType: 'bool', type: 'bool' }],
    name: 'setOnlyCallerCheck',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'enabled', internalType: 'bool', type: 'bool' },
      { name: 'signature', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'setOnlyCallerCheckWithSignature',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xD3cf852898b21fc233251427c2DC93d3d604F3BB)
 */
export const feeDistributorAddress = {
  1: '0xD3cf852898b21fc233251427c2DC93d3d604F3BB',
} as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xD3cf852898b21fc233251427c2DC93d3d604F3BB)
 */
export const feeDistributorConfig = {
  address: feeDistributorAddress,
  abi: feeDistributorAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// veBal
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xC128a9954e6c874eA3d62ce62B468bA073093F25)
 */
export const veBalAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'provider', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
      { name: 'locktime', type: 'uint256', indexed: true },
      { name: 'type', type: 'int128', indexed: false },
      { name: 'ts', type: 'uint256', indexed: false },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'provider', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
      { name: 'ts', type: 'uint256', indexed: false },
    ],
    name: 'Withdraw',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'prevSupply', type: 'uint256', indexed: false },
      { name: 'supply', type: 'uint256', indexed: false },
    ],
    name: 'Supply',
  },
  {
    type: 'constructor',
    inputs: [
      { name: 'token_addr', type: 'address' },
      { name: '_name', type: 'string' },
      { name: '_symbol', type: 'string' },
      { name: '_authorizer_adaptor', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'admin',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'addr', type: 'address' }],
    name: 'commit_smart_wallet_checker',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'apply_smart_wallet_checker',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'addr', type: 'address' }],
    name: 'get_last_user_slope',
    outputs: [{ name: '', type: 'int128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_addr', type: 'address' },
      { name: '_idx', type: 'uint256' },
    ],
    name: 'user_point_history__ts',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_addr', type: 'address' }],
    name: 'locked__end',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'checkpoint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_addr', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'deposit_for',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_value', type: 'uint256' },
      { name: '_unlock_time', type: 'uint256' },
    ],
    name: 'create_lock',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_value', type: 'uint256' }],
    name: 'increase_amount',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_unlock_time', type: 'uint256' }],
    name: 'increase_unlock_time',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'addr', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'addr', type: 'address' },
      { name: '_t', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'addr', type: 'address' },
      { name: '_block', type: 'uint256' },
    ],
    name: 'balanceOfAt',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 't', type: 'uint256' }],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_block', type: 'uint256' }],
    name: 'totalSupplyAt',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'supply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'arg0', type: 'address' }],
    name: 'locked',
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'amount', type: 'int128' },
          { name: 'end', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epoch',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'arg0', type: 'uint256' }],
    name: 'point_history',
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'bias', type: 'int128' },
          { name: 'slope', type: 'int128' },
          { name: 'ts', type: 'uint256' },
          { name: 'blk', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'arg0', type: 'address' },
      { name: 'arg1', type: 'uint256' },
    ],
    name: 'user_point_history',
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'bias', type: 'int128' },
          { name: 'slope', type: 'int128' },
          { name: 'ts', type: 'uint256' },
          { name: 'blk', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'arg0', type: 'address' }],
    name: 'user_point_epoch',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'arg0', type: 'uint256' }],
    name: 'slope_changes',
    outputs: [{ name: '', type: 'int128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'future_smart_wallet_checker',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'smart_wallet_checker',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
] as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xC128a9954e6c874eA3d62ce62B468bA073093F25)
 */
export const veBalAddress = {
  1: '0xC128a9954e6c874eA3d62ce62B468bA073093F25',
} as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0xC128a9954e6c874eA3d62ce62B468bA073093F25)
 */
export const veBalConfig = { address: veBalAddress, abi: veBalAbi } as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// veDelegationProxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f5a2eE11E7a772AeB5114A20d0D7c0ff61EB8A0)
 */
export const veDelegationProxyAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'vault', internalType: 'contract IVault', type: 'address' },
      {
        name: 'votingEscrow',
        internalType: 'contract IERC20',
        type: 'address',
      },
      {
        name: 'delegation',
        internalType: 'contract IVeDelegation',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newImplementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'DelegationImplementationUpdated',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'adjustedBalanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'adjusted_balance_of',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'selector', internalType: 'bytes4', type: 'bytes4' }],
    name: 'getActionId',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAuthorizer',
    outputs: [{ name: '', internalType: 'contract IAuthorizer', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getDelegationImplementation',
    outputs: [{ name: '', internalType: 'contract IVeDelegation', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getVault',
    outputs: [{ name: '', internalType: 'contract IVault', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getVotingEscrow',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'killDelegation',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'delegation',
        internalType: 'contract IVeDelegation',
        type: 'address',
      },
    ],
    name: 'setDelegation',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f5a2eE11E7a772AeB5114A20d0D7c0ff61EB8A0)
 */
export const veDelegationProxyAddress = {
  1: '0x6f5a2eE11E7a772AeB5114A20d0D7c0ff61EB8A0',
} as const

/**
 * [__View Contract on Ethereum Etherscan__](https://etherscan.io/address/0x6f5a2eE11E7a772AeB5114A20d0D7c0ff61EB8A0)
 */
export const veDelegationProxyConfig = {
  address: veDelegationProxyAddress,
  abi: veDelegationProxyAbi,
} as const
