//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SFC
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sonic Sonic Explorer__](https://sonicscan.org//address/0x0aB8f3b709A52c096f33702fE8153776472305ed)
 */
export const sfcAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  { type: 'error', inputs: [], name: 'AlreadyRedirected' },
  {
    type: 'error',
    inputs: [{ name: 'implementation', internalType: 'address', type: 'address' }],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'InsufficientSelfStake' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'MalformedPubkey' },
  { type: 'error', inputs: [], name: 'NoUnresolvedTreasuryFees' },
  { type: 'error', inputs: [], name: 'NotAuthorized' },
  { type: 'error', inputs: [], name: 'NotDeactivatedStatus' },
  { type: 'error', inputs: [], name: 'NotDriverAuth' },
  { type: 'error', inputs: [], name: 'NotEnoughEpochsPassed' },
  { type: 'error', inputs: [], name: 'NotEnoughTimePassed' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'NothingToStash' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'PubkeyUsedByOtherValidator' },
  { type: 'error', inputs: [], name: 'Redirected' },
  { type: 'error', inputs: [], name: 'RefundRatioTooHigh' },
  { type: 'error', inputs: [], name: 'RequestExists' },
  { type: 'error', inputs: [], name: 'RequestNotExists' },
  { type: 'error', inputs: [], name: 'SameAddress' },
  { type: 'error', inputs: [], name: 'SameRedirectionAuthorizer' },
  { type: 'error', inputs: [], name: 'StakeIsFullySlashed' },
  { type: 'error', inputs: [], name: 'StakeSubscriberFailed' },
  { type: 'error', inputs: [], name: 'TransferFailed' },
  { type: 'error', inputs: [], name: 'TransfersNotAllowed' },
  { type: 'error', inputs: [], name: 'TreasuryNotSet' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  { type: 'error', inputs: [], name: 'ValidatorDelegationLimitExceeded' },
  { type: 'error', inputs: [], name: 'ValidatorExists' },
  { type: 'error', inputs: [], name: 'ValidatorNotActive' },
  { type: 'error', inputs: [], name: 'ValidatorNotExists' },
  { type: 'error', inputs: [], name: 'ValidatorNotSlashed' },
  { type: 'error', inputs: [], name: 'ValueTooLarge' },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
  { type: 'error', inputs: [], name: 'ZeroAmount' },
  { type: 'error', inputs: [], name: 'ZeroRewards' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'AnnouncedRedirection',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'BurntNativeTokens',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'validatorID',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'status',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ChangedValidatorStatus',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'delegator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'toValidatorID',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'rewards',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ClaimedRewards',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'validatorID',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'auth', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'createdEpoch',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'createdTime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CreatedValidator',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'validatorID',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'deactivatedEpoch',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'deactivatedTime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DeactivatedValidator',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'delegator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'toValidatorID',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Delegated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'delegator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'validatorID',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RefundedSlashedLegacyDelegation',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'delegator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'toValidatorID',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'rewards',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RestakedRewards',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TreasuryFeesResolved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'delegator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'toValidatorID',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'wrID', internalType: 'uint256', type: 'uint256', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Undelegated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'validatorID',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'refundRatio',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'UpdatedSlashingRefundRatio',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'delegator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'toValidatorID',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'wrID', internalType: 'uint256', type: 'uint256', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'penalty',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Withdrawn',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'validatorID', internalType: 'uint256', type: 'uint256' },
      { name: 'syncPubkey', internalType: 'bool', type: 'bool' },
    ],
    name: '_syncValidator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'announceRedirection',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'burnNativeTokens',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'toValidatorID', internalType: 'uint256', type: 'uint256' }],
    name: 'claimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'constsAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'pubkey', internalType: 'bytes', type: 'bytes' }],
    name: 'createValidator',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'currentEpoch',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'currentSealedEpoch',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'validatorID', internalType: 'uint256', type: 'uint256' },
      { name: 'status', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'deactivateValidator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'toValidatorID', internalType: 'uint256', type: 'uint256' }],
    name: 'delegate',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'validatorID', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getEpochAccumulatedOriginatedTxsFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'validatorID', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getEpochAccumulatedRewardPerToken',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'validatorID', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getEpochAccumulatedUptime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'validatorID', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getEpochAverageUptime',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'epoch', internalType: 'uint256', type: 'uint256' }],
    name: 'getEpochEndBlock',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'validatorID', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getEpochOfflineBlocks',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'validatorID', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getEpochOfflineTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'validatorID', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getEpochReceivedStake',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'epoch', internalType: 'uint256', type: 'uint256' }],
    name: 'getEpochSnapshot',
    outputs: [
      { name: 'endTime', internalType: 'uint256', type: 'uint256' },
      { name: 'endBlock', internalType: 'uint256', type: 'uint256' },
      { name: 'epochFee', internalType: 'uint256', type: 'uint256' },
      { name: 'baseRewardPerSecond', internalType: 'uint256', type: 'uint256' },
      { name: 'totalStake', internalType: 'uint256', type: 'uint256' },
      { name: 'totalSupply', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'epoch', internalType: 'uint256', type: 'uint256' }],
    name: 'getEpochValidatorIDs',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'delegator', internalType: 'address', type: 'address' }],
    name: 'getRedirection',
    outputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'delegator', internalType: 'address', type: 'address' }],
    name: 'getRedirectionRequest',
    outputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'validatorID', internalType: 'uint256', type: 'uint256' }],
    name: 'getSelfStake',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'delegator', internalType: 'address', type: 'address' },
      { name: 'validatorID', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getStake',
    outputs: [{ name: 'stake', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'validatorID', internalType: 'uint256', type: 'uint256' }],
    name: 'getValidator',
    outputs: [
      { name: 'status', internalType: 'uint256', type: 'uint256' },
      { name: 'receivedStake', internalType: 'uint256', type: 'uint256' },
      { name: 'auth', internalType: 'address', type: 'address' },
      { name: 'createdEpoch', internalType: 'uint256', type: 'uint256' },
      { name: 'createdTime', internalType: 'uint256', type: 'uint256' },
      { name: 'deactivatedTime', internalType: 'uint256', type: 'uint256' },
      { name: 'deactivatedEpoch', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'auth', internalType: 'address', type: 'address' }],
    name: 'getValidatorID',
    outputs: [{ name: 'validatorID', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'validatorID', internalType: 'uint256', type: 'uint256' }],
    name: 'getValidatorPubkey',
    outputs: [{ name: 'pubkey', internalType: 'bytes', type: 'bytes' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'delegator', internalType: 'address', type: 'address' },
      { name: 'validatorID', internalType: 'uint256', type: 'uint256' },
      { name: 'wrID', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getWithdrawalRequest',
    outputs: [
      { name: 'epoch', internalType: 'uint256', type: 'uint256' },
      { name: 'time', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'sealedEpoch', internalType: 'uint256', type: 'uint256' },
      { name: '_totalSupply', internalType: 'uint256', type: 'uint256' },
      { name: 'nodeDriver', internalType: 'address', type: 'address' },
      { name: '_c', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'initiateRedirection',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'validatorID', internalType: 'uint256', type: 'uint256' }],
    name: 'isSlashed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'issueTokens',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lastValidatorID',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'delegator', internalType: 'address', type: 'address' },
      { name: 'toValidatorID', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'pendingRewards',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'pubkeyAddress', internalType: 'address', type: 'address' }],
    name: 'pubkeyAddressToValidatorID',
    outputs: [{ name: 'validatorID', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'redirect',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'redirectionAuthorizer',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'resolveTreasuryFees',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'toValidatorID', internalType: 'uint256', type: 'uint256' }],
    name: 'restakeRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'delegator', internalType: 'address', type: 'address' },
      { name: 'validatorID', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'rewardsStash',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'offlineTime', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'offlineBlocks', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'uptimes', internalType: 'uint256[]', type: 'uint256[]' },
      {
        name: 'originatedTxsFee',
        internalType: 'uint256[]',
        type: 'uint256[]',
      },
    ],
    name: 'sealEpoch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'nextValidatorIDs',
        internalType: 'uint256[]',
        type: 'uint256[]',
      },
    ],
    name: 'sealEpochValidators',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'delegator', internalType: 'address', type: 'address' },
      { name: 'toValidatorID', internalType: 'uint256', type: 'uint256' },
      { name: 'stake', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setGenesisDelegation',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'auth', internalType: 'address', type: 'address' },
      { name: 'validatorID', internalType: 'uint256', type: 'uint256' },
      { name: 'pubkey', internalType: 'bytes', type: 'bytes' },
      { name: 'createdTime', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setGenesisValidator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'v', internalType: 'address', type: 'address' }],
    name: 'setRedirectionAuthorizer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'validatorID', internalType: 'uint256', type: 'uint256' }],
    name: 'slashingRefundRatio',
    outputs: [{ name: 'refundRatio', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'stakeSubscriberAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'delegator', internalType: 'address', type: 'address' },
      { name: 'toValidatorID', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'stashRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'delegator', internalType: 'address', type: 'address' },
      { name: 'validatorID', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'stashedRewardsUntilEpoch',
    outputs: [{ name: 'epoch', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalActiveStake',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalStake',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasuryAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'toValidatorID', internalType: 'uint256', type: 'uint256' },
      { name: 'wrID', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'undelegate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unresolvedTreasuryFees',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'v', internalType: 'address', type: 'address' }],
    name: 'updateConstsAddress',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'validatorID', internalType: 'uint256', type: 'uint256' },
      { name: 'refundRatio', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'updateSlashingRefundRatio',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'v', internalType: 'address', type: 'address' }],
    name: 'updateStakeSubscriberAddress',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'v', internalType: 'address', type: 'address' }],
    name: 'updateTreasuryAddress',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'version',
    outputs: [{ name: '', internalType: 'bytes3', type: 'bytes3' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'toValidatorID', internalType: 'uint256', type: 'uint256' },
      { name: 'wrID', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

/**
 * [__View Contract on Sonic Sonic Explorer__](https://sonicscan.org//address/0x0aB8f3b709A52c096f33702fE8153776472305ed)
 */
export const sfcAddress = {
  146: '0x0aB8f3b709A52c096f33702fE8153776472305ed',
} as const

/**
 * [__View Contract on Sonic Sonic Explorer__](https://sonicscan.org//address/0x0aB8f3b709A52c096f33702fE8153776472305ed)
 */
export const sfcConfig = { address: sfcAddress, abi: sfcAbi } as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SonicStaking
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sonic Sonic Explorer__](https://sonicscan.org//address/0xd5f7fc8ba92756a34693baa386edcc8dd5b3f141)
 */
export const sonicStakingAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  { type: 'error', inputs: [], name: 'ArrayLengthMismatch' },
  { type: 'error', inputs: [], name: 'DelegateAmountCannotBeZero' },
  { type: 'error', inputs: [], name: 'DepositPaused' },
  { type: 'error', inputs: [], name: 'DepositTooSmall' },
  { type: 'error', inputs: [], name: 'DonationAmountCannotBeZero' },
  { type: 'error', inputs: [], name: 'DonationAmountTooSmall' },
  { type: 'error', inputs: [], name: 'ECDSAInvalidSignature' },
  {
    type: 'error',
    inputs: [{ name: 'length', internalType: 'uint256', type: 'uint256' }],
    name: 'ECDSAInvalidSignatureLength',
  },
  {
    type: 'error',
    inputs: [{ name: 's', internalType: 'bytes32', type: 'bytes32' }],
    name: 'ECDSAInvalidSignatureS',
  },
  {
    type: 'error',
    inputs: [{ name: 'implementation', internalType: 'address', type: 'address' }],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
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
  {
    type: 'error',
    inputs: [{ name: 'deadline', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC2612ExpiredSignature',
  },
  {
    type: 'error',
    inputs: [
      { name: 'signer', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC2612InvalidSigner',
  },
  { type: 'error', inputs: [], name: 'FailedCall' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'currentNonce', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InvalidAccountNonce',
  },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NativeTransferFailed' },
  {
    type: 'error',
    inputs: [{ name: 'validatorId', internalType: 'uint256', type: 'uint256' }],
    name: 'NoDelegationForValidator',
  },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'PausedValueDidNotChange' },
  { type: 'error', inputs: [], name: 'ProtocolFeeTooHigh' },
  { type: 'error', inputs: [], name: 'ProtocolFeeTransferFailed' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  { type: 'error', inputs: [], name: 'RewardsClaimedTooSmall' },
  { type: 'error', inputs: [], name: 'SFCAddressCannotBeZero' },
  { type: 'error', inputs: [], name: 'SenderNotSFC' },
  {
    type: 'error',
    inputs: [{ name: 'refundRatio', internalType: 'uint256', type: 'uint256' }],
    name: 'SfcSlashMustBeAccepted',
  },
  { type: 'error', inputs: [], name: 'TreasuryAddressCannotBeZero' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  {
    type: 'error',
    inputs: [{ name: 'withdrawId', internalType: 'uint256', type: 'uint256' }],
    name: 'UnauthorizedWithdraw',
  },
  { type: 'error', inputs: [], name: 'UndelegateAmountCannotBeZero' },
  {
    type: 'error',
    inputs: [{ name: 'validatorId', internalType: 'uint256', type: 'uint256' }],
    name: 'UndelegateAmountExceedsDelegated',
  },
  { type: 'error', inputs: [], name: 'UndelegateAmountExceedsPool' },
  { type: 'error', inputs: [], name: 'UndelegateAmountTooSmall' },
  { type: 'error', inputs: [], name: 'UndelegateFromPoolPaused' },
  { type: 'error', inputs: [], name: 'UndelegatePaused' },
  { type: 'error', inputs: [], name: 'UnsupportedWithdrawKind' },
  { type: 'error', inputs: [], name: 'UserWithdrawsMaxSizeCannotBeZero' },
  { type: 'error', inputs: [], name: 'UserWithdrawsSkipTooLarge' },
  {
    type: 'error',
    inputs: [{ name: 'withdrawId', internalType: 'uint256', type: 'uint256' }],
    name: 'WithdrawAlreadyProcessed',
  },
  {
    type: 'error',
    inputs: [{ name: 'withdrawId', internalType: 'uint256', type: 'uint256' }],
    name: 'WithdrawDelayNotElapsed',
  },
  {
    type: 'error',
    inputs: [{ name: 'withdrawId', internalType: 'uint256', type: 'uint256' }],
    name: 'WithdrawIdDoesNotExist',
  },
  { type: 'error', inputs: [], name: 'WithdrawsPaused' },
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
        name: 'validatorId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'amountAssets',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Delegated',
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
      { name: 'newValue', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'DepositPausedUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amountAssets',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amountShares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Deposited',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amountAssets',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Donated',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'EIP712DomainChanged' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'withdrawId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'amountAssetsWithdrawn',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'emergency', internalType: 'bool', type: 'bool', indexed: true },
    ],
    name: 'OperatorClawBackExecuted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'withdrawId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'validatorId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'amountAssets',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'OperatorClawBackInitiated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
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
        name: 'newFeeBIPS',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'ProtocolFeeUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'amountClaimed',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'protocolFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RewardsClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
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
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
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
    ],
    name: 'RoleRevoked',
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
        name: 'newTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TreasuryUpdated',
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
      { name: 'newValue', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'UndelegateFromPoolPausedUpdated',
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
      { name: 'newValue', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'UndelegatePausedUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'withdrawId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'validatorId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amountAssets',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'kind',
        internalType: 'enum SonicStaking.WithdrawKind',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'Undelegated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
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
        name: 'delay',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'WithdrawDelaySet',
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
      { name: 'newValue', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'WithdrawPausedUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'withdrawId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amountAssets',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'kind',
        internalType: 'enum SonicStaking.WithdrawKind',
        type: 'uint8',
        indexed: false,
      },
      { name: 'emergency', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'Withdrawn',
  },
  {
    type: 'function',
    inputs: [],
    name: 'CLAIM_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
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
    inputs: [],
    name: 'MAX_PROTOCOL_FEE_BIPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_CLAIM_REWARDS_AMOUNT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_DEPOSIT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_DONATION_AMOUNT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_UNDELEGATE_AMOUNT_SHARES',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'OPERATOR_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SFC',
    outputs: [{ name: '', internalType: 'contract ISFC', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
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
      { name: 'value', internalType: 'uint256', type: 'uint256' },
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
    inputs: [{ name: 'value', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'burnFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'validatorIds', internalType: 'uint256[]', type: 'uint256[]' }],
    name: 'claimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'sharesAmount', internalType: 'uint256', type: 'uint256' }],
    name: 'convertToAssets',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'assetAmount', internalType: 'uint256', type: 'uint256' }],
    name: 'convertToShares',
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
      { name: 'validatorId', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'delegate',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'deposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'depositPaused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'donate',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      { name: 'fields', internalType: 'bytes1', type: 'bytes1' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'version', internalType: 'string', type: 'string' },
      { name: 'chainId', internalType: 'uint256', type: 'uint256' },
      { name: 'verifyingContract', internalType: 'address', type: 'address' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
      { name: 'extensions', internalType: 'uint256[]', type: 'uint256[]' },
    ],
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
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'skip', internalType: 'uint256', type: 'uint256' },
      { name: 'maxSize', internalType: 'uint256', type: 'uint256' },
      { name: 'reverseOrder', internalType: 'bool', type: 'bool' },
    ],
    name: 'getUserWithdraws',
    outputs: [
      {
        name: '',
        internalType: 'struct SonicStaking.WithdrawRequest[]',
        type: 'tuple[]',
        components: [
          {
            name: 'kind',
            internalType: 'enum SonicStaking.WithdrawKind',
            type: 'uint8',
          },
          { name: 'validatorId', internalType: 'uint256', type: 'uint256' },
          { name: 'assetAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'isWithdrawn', internalType: 'bool', type: 'bool' },
          {
            name: 'requestTimestamp',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'user', internalType: 'address', type: 'address' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'withdrawId', internalType: 'uint256', type: 'uint256' }],
    name: 'getWithdrawRequest',
    outputs: [
      {
        name: '',
        internalType: 'struct SonicStaking.WithdrawRequest',
        type: 'tuple',
        components: [
          {
            name: 'kind',
            internalType: 'enum SonicStaking.WithdrawKind',
            type: 'uint8',
          },
          { name: 'validatorId', internalType: 'uint256', type: 'uint256' },
          { name: 'assetAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'isWithdrawn', internalType: 'bool', type: 'bool' },
          {
            name: 'requestTimestamp',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'user', internalType: 'address', type: 'address' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_sfc', internalType: 'contract ISFC', type: 'address' },
      { name: '_treasury', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
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
      { name: 'withdrawId', internalType: 'uint256', type: 'uint256' },
      { name: 'emergency', internalType: 'bool', type: 'bool' },
    ],
    name: 'operatorExecuteClawBack',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'validatorId', internalType: 'uint256', type: 'uint256' },
      { name: 'amountAssets', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'operatorInitiateClawBack',
    outputs: [
      { name: 'withdrawId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'actualAmountUndelegated',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
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
    name: 'pendingClawBackAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [],
    name: 'protocolFeeBIPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newValue', internalType: 'bool', type: 'bool' }],
    name: 'setDepositPaused',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newFeeBIPS', internalType: 'uint256', type: 'uint256' }],
    name: 'setProtocolFeeBIPS',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newTreasury', internalType: 'address', type: 'address' }],
    name: 'setTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newValue', internalType: 'bool', type: 'bool' }],
    name: 'setUndelegateFromPoolPaused',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newValue', internalType: 'bool', type: 'bool' }],
    name: 'setUndelegatePaused',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'delay', internalType: 'uint256', type: 'uint256' }],
    name: 'setWithdrawDelay',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newValue', internalType: 'bool', type: 'bool' }],
    name: 'setWithdrawPaused',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
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
    name: 'totalAssets',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalDelegated',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'validatorId', internalType: 'uint256', type: 'uint256' },
      { name: 'amountShares', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'undelegate',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amountShares', internalType: 'uint256', type: 'uint256' }],
    name: 'undelegateFromPool',
    outputs: [{ name: 'withdrawId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'undelegateFromPoolPaused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'validatorIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'amountShares', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'undelegateMany',
    outputs: [{ name: 'withdrawIds', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'undelegatePaused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'userNumWithdraws',
    outputs: [{ name: 'numWithdraws', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'userWithdraws',
    outputs: [{ name: 'withdrawId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'withdrawId', internalType: 'uint256', type: 'uint256' },
      { name: 'emergency', internalType: 'bool', type: 'bool' },
    ],
    name: 'withdraw',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdrawCounter',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdrawDelay',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'withdrawIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'emergency', internalType: 'bool', type: 'bool' },
    ],
    name: 'withdrawMany',
    outputs: [
      {
        name: 'amountsWithdrawn',
        internalType: 'uint256[]',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdrawPaused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

/**
 * [__View Contract on Sonic Sonic Explorer__](https://sonicscan.org//address/0xd5f7fc8ba92756a34693baa386edcc8dd5b3f141)
 */
export const sonicStakingAddress = {
  146: '0xD5F7FC8ba92756a34693bAA386Edcc8Dd5B3F141',
} as const

/**
 * [__View Contract on Sonic Sonic Explorer__](https://sonicscan.org//address/0xd5f7fc8ba92756a34693baa386edcc8dd5b3f141)
 */
export const sonicStakingConfig = {
  address: sonicStakingAddress,
  abi: sonicStakingAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SonicStakingWithdrawRequestHelper
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Sonic Sonic Explorer__](https://sonicscan.org//address/0x52b16e3d7d25ba64f242e59f9a74799ecc432d78)
 */
export const sonicStakingWithdrawRequestHelperAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_sonicStaking',
        internalType: 'address payable',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'UserWithdrawsMaxSizeCannotBeZero' },
  { type: 'error', inputs: [], name: 'UserWithdrawsSkipTooLarge' },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'skip', internalType: 'uint256', type: 'uint256' },
      { name: 'maxSize', internalType: 'uint256', type: 'uint256' },
      { name: 'reverseOrder', internalType: 'bool', type: 'bool' },
    ],
    name: 'getUserWithdraws',
    outputs: [
      {
        name: 'withdraws',
        internalType: 'struct SonicStakingWithdrawRequestHelper.WithdrawRequest[]',
        type: 'tuple[]',
        components: [
          { name: 'id', internalType: 'uint256', type: 'uint256' },
          {
            name: 'kind',
            internalType: 'enum SonicStaking.WithdrawKind',
            type: 'uint8',
          },
          { name: 'validatorId', internalType: 'uint256', type: 'uint256' },
          { name: 'assetAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'isWithdrawn', internalType: 'bool', type: 'bool' },
          {
            name: 'requestTimestamp',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'user', internalType: 'address', type: 'address' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserWithdrawsCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'withdrawId', internalType: 'uint256', type: 'uint256' }],
    name: 'getWithdrawRequest',
    outputs: [
      {
        name: '',
        internalType: 'struct SonicStakingWithdrawRequestHelper.WithdrawRequest',
        type: 'tuple',
        components: [
          { name: 'id', internalType: 'uint256', type: 'uint256' },
          {
            name: 'kind',
            internalType: 'enum SonicStaking.WithdrawKind',
            type: 'uint8',
          },
          { name: 'validatorId', internalType: 'uint256', type: 'uint256' },
          { name: 'assetAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'isWithdrawn', internalType: 'bool', type: 'bool' },
          {
            name: 'requestTimestamp',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'user', internalType: 'address', type: 'address' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'sonicStaking',
    outputs: [{ name: '', internalType: 'contract SonicStaking', type: 'address' }],
    stateMutability: 'view',
  },
] as const

/**
 * [__View Contract on Sonic Sonic Explorer__](https://sonicscan.org//address/0x52b16e3d7d25ba64f242e59f9a74799ecc432d78)
 */
export const sonicStakingWithdrawRequestHelperAddress = {
  146: '0x52B16e3D7d25bA64F242e59f9A74799ecC432d78',
} as const

/**
 * [__View Contract on Sonic Sonic Explorer__](https://sonicscan.org//address/0x52b16e3d7d25ba64f242e59f9a74799ecc432d78)
 */
export const sonicStakingWithdrawRequestHelperConfig = {
  address: sonicStakingWithdrawRequestHelperAddress,
  abi: sonicStakingWithdrawRequestHelperAbi,
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
