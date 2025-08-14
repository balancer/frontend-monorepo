export const LS_KEYS = {
  UserAddress: 'userAddress',
  UserSettings: {
    ColorMode: 'chakra-ui-color-mode', // Has to be this string to match Chakra's default
    Currency: 'userSettings.Currency',
    Slippage: 'userSettings.Slippage',
    EnableSignatures: 'userSettings.EnableSignatures',
    PoolListView: 'userSettings.PoolListView',
    AcceptedPolicies: 'userSettings.AcceptedPolicies',
    AllowSounds: 'userSettings.AllowSounds',
    EnableTxBundling: 'userSettings.EnableTxBundling',
  },
  CrossChainSync: {
    TempSyncingNetworks: 'сrossChainSync.tempSyncingNetworks',
    SyncTxHashes: 'сrossChainSync.syncTxHashes',
  },
  LbpConfig: {
    SaleStructure: 'lbpConfig.saleStructure',
    ProjectInfo: 'lbpConfig.projectInfo',
    StepIndex: 'lbpConfig.stepIndex',
    PoolAddress: 'lbpConfig.poolAddress',
    IsMetadataSaved: 'lbpConfig.isMetadataSaved',
  },
  PoolCreation: {
    Config: 'poolCreation.config',
    StepIndex: 'poolCreation.stepIndex',
    PoolAddress: 'poolCreation.poolAddress',
  },
}
