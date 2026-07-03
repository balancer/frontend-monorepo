/**
 * V3 ProtocolFeeController — parameter-change event ABIs (decode-only).
 *
 * Address is per-chain — looked up via `lib/contracts/v3-addresses.ts`.
 * Events expose `pool` as an indexed first argument, mirroring the Vault's
 * event shape. Phase A leaves the ABI minimal; Phase B verifies against
 * `balancer/balancer-v3-monorepo`'s IProtocolFeeController interface.
 */

export const v3FeeControllerEventsAbi = [{
    "inputs": [{
        "internalType": "contract IVault",
        "name": "vault_",
        "type": "address"
    }, {
        "internalType": "uint256",
        "name": "initialGlobalSwapFeePercentage",
        "type": "uint256"
    }, {"internalType": "uint256", "name": "initialGlobalYieldFeePercentage", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
}, {
    "inputs": [{"internalType": "address", "name": "target", "type": "address"}],
    "name": "AddressEmptyCode",
    "type": "error"
}, {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "AddressInsufficientBalance",
    "type": "error"
}, {
    "inputs": [{"internalType": "address", "name": "caller", "type": "address"}, {
        "internalType": "address",
        "name": "pool",
        "type": "address"
    }], "name": "CallerIsNotPoolCreator", "type": "error"
}, {"inputs": [], "name": "FailedInnerCall", "type": "error"}, {
    "inputs": [],
    "name": "FeePrecisionTooHigh",
    "type": "error"
}, {"inputs": [], "name": "InvalidMigrationSource", "type": "error"}, {
    "inputs": [{
        "internalType": "address",
        "name": "pool",
        "type": "address"
    }], "name": "PoolAlreadyRegistered", "type": "error"
}, {"inputs": [], "name": "PoolCreatorFeePercentageTooHigh", "type": "error"}, {
    "inputs": [{
        "internalType": "address",
        "name": "pool",
        "type": "address"
    }], "name": "PoolCreatorNotRegistered", "type": "error"
}, {"inputs": [], "name": "ProtocolSwapFeePercentageTooHigh", "type": "error"}, {
    "inputs": [],
    "name": "ProtocolYieldFeePercentageTooHigh",
    "type": "error"
}, {"inputs": [], "name": "ReentrancyGuardReentrantCall", "type": "error"}, {
    "inputs": [{
        "internalType": "uint8",
        "name": "bits",
        "type": "uint8"
    }, {"internalType": "uint256", "name": "value", "type": "uint256"}],
    "name": "SafeCastOverflowedUintDowncast",
    "type": "error"
}, {
    "inputs": [{"internalType": "address", "name": "token", "type": "address"}],
    "name": "SafeERC20FailedOperation",
    "type": "error"
}, {
    "inputs": [{"internalType": "address", "name": "sender", "type": "address"}],
    "name": "SenderIsNotVault",
    "type": "error"
}, {"inputs": [], "name": "SenderNotAllowed", "type": "error"}, {
    "inputs": [],
    "name": "ZeroDivision",
    "type": "error"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "uint256", "name": "swapFeePercentage", "type": "uint256"}],
    "name": "GlobalProtocolSwapFeePercentageChanged",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "uint256", "name": "yieldFeePercentage", "type": "uint256"}],
    "name": "GlobalProtocolYieldFeePercentageChanged",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "pool", "type": "address"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "aggregateSwapFeePercentage",
        "type": "uint256"
    }, {"indexed": false, "internalType": "bool", "name": "isProtocolFeeExempt", "type": "bool"}],
    "name": "InitialPoolAggregateSwapFeePercentage",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "pool", "type": "address"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "aggregateYieldFeePercentage",
        "type": "uint256"
    }, {"indexed": false, "internalType": "bool", "name": "isProtocolFeeExempt", "type": "bool"}],
    "name": "InitialPoolAggregateYieldFeePercentage",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "pool", "type": "address"}, {
        "indexed": true,
        "internalType": "contract IERC20",
        "name": "token",
        "type": "address"
    }, {"indexed": true, "internalType": "address", "name": "recipient", "type": "address"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
    }],
    "name": "PoolCreatorFeesWithdrawn",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "pool", "type": "address"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "poolCreatorSwapFeePercentage",
        "type": "uint256"
    }],
    "name": "PoolCreatorSwapFeePercentageChanged",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "pool", "type": "address"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "poolCreatorYieldFeePercentage",
        "type": "uint256"
    }],
    "name": "PoolCreatorYieldFeePercentageChanged",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "pool", "type": "address"}, {
        "indexed": true,
        "internalType": "address",
        "name": "poolCreator",
        "type": "address"
    }, {"indexed": false, "internalType": "bool", "name": "protocolFeeExempt", "type": "bool"}],
    "name": "PoolRegisteredWithFeeController",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "pool", "type": "address"}, {
        "indexed": true,
        "internalType": "contract IERC20",
        "name": "token",
        "type": "address"
    }, {"indexed": true, "internalType": "address", "name": "recipient", "type": "address"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
    }],
    "name": "ProtocolFeesWithdrawn",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "pool", "type": "address"}, {
        "indexed": true,
        "internalType": "contract IERC20",
        "name": "token",
        "type": "address"
    }, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "ProtocolSwapFeeCollected",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "pool", "type": "address"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "swapFeePercentage",
        "type": "uint256"
    }],
    "name": "ProtocolSwapFeePercentageChanged",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "pool", "type": "address"}, {
        "indexed": true,
        "internalType": "contract IERC20",
        "name": "token",
        "type": "address"
    }, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "ProtocolYieldFeeCollected",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "pool", "type": "address"}, {
        "indexed": false,
        "internalType": "uint256",
        "name": "yieldFeePercentage",
        "type": "uint256"
    }],
    "name": "ProtocolYieldFeePercentageChanged",
    "type": "event"
}, {
    "inputs": [],
    "name": "MAX_CREATOR_FEE_PERCENTAGE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "MAX_PROTOCOL_SWAP_FEE_PERCENTAGE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "MAX_PROTOCOL_YIELD_FEE_PERCENTAGE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}],
    "name": "collectAggregateFees",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}],
    "name": "collectAggregateFeesHook",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{
        "internalType": "uint256",
        "name": "protocolFeePercentage",
        "type": "uint256"
    }, {"internalType": "uint256", "name": "poolCreatorFeePercentage", "type": "uint256"}],
    "name": "computeAggregateFeePercentage",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "pure",
    "type": "function"
}, {
    "inputs": [{"internalType": "bytes4", "name": "selector", "type": "bytes4"}],
    "name": "getActionId",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "getAuthorizer",
    "outputs": [{"internalType": "contract IAuthorizer", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "getGlobalProtocolSwapFeePercentage",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "getGlobalProtocolYieldFeePercentage",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}],
    "name": "getPoolCreatorFeeAmounts",
    "outputs": [{"internalType": "uint256[]", "name": "feeAmounts", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}],
    "name": "getPoolCreatorSwapFeePercentage",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}],
    "name": "getPoolCreatorYieldFeePercentage",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}],
    "name": "getPoolProtocolSwapFeeInfo",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}, {
        "internalType": "bool",
        "name": "",
        "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}],
    "name": "getPoolProtocolYieldFeeInfo",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}, {
        "internalType": "bool",
        "name": "",
        "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}],
    "name": "getProtocolFeeAmounts",
    "outputs": [{"internalType": "uint256[]", "name": "feeAmounts", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "getVault",
    "outputs": [{"internalType": "contract IVault", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}],
    "name": "isPoolRegistered",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}],
    "name": "migratePool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}, {
        "internalType": "address",
        "name": "poolCreator",
        "type": "address"
    }, {"internalType": "bool", "name": "protocolFeeExempt", "type": "bool"}],
    "name": "registerPool",
    "outputs": [{
        "internalType": "uint256",
        "name": "aggregateSwapFeePercentage",
        "type": "uint256"
    }, {"internalType": "uint256", "name": "aggregateYieldFeePercentage", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "newProtocolSwapFeePercentage", "type": "uint256"}],
    "name": "setGlobalProtocolSwapFeePercentage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "newProtocolYieldFeePercentage", "type": "uint256"}],
    "name": "setGlobalProtocolYieldFeePercentage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}, {
        "internalType": "uint256",
        "name": "poolCreatorSwapFeePercentage",
        "type": "uint256"
    }], "name": "setPoolCreatorSwapFeePercentage", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}, {
        "internalType": "uint256",
        "name": "poolCreatorYieldFeePercentage",
        "type": "uint256"
    }], "name": "setPoolCreatorYieldFeePercentage", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}, {
        "internalType": "uint256",
        "name": "newProtocolSwapFeePercentage",
        "type": "uint256"
    }], "name": "setProtocolSwapFeePercentage", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}, {
        "internalType": "uint256",
        "name": "newProtocolYieldFeePercentage",
        "type": "uint256"
    }], "name": "setProtocolYieldFeePercentage", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}],
    "name": "updateProtocolSwapFeePercentage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}],
    "name": "updateProtocolYieldFeePercentage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [],
    "name": "vault",
    "outputs": [{"internalType": "contract IVault", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}],
    "name": "withdrawPoolCreatorFees",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}, {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
    }], "name": "withdrawPoolCreatorFees", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}, {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
    }], "name": "withdrawProtocolFees", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "pool", "type": "address"}, {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
    }, {"internalType": "contract IERC20", "name": "token", "type": "address"}],
    "name": "withdrawProtocolFeesForToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}];
