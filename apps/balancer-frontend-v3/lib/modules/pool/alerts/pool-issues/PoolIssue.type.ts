/**  Must be in a different file than getPoolIssueAlerts to avoid circular imports */
export enum PoolIssue {
  PoolProtocolFeeVulnWarning = 'poolProtocolFeeVulnWarning',
  PoolOwnerVulnWarningGovernanceMigrate = 'poolOwnerVulnWarningGovernanceMigrate',
  PoolOwnerVulnWarningGovernanceWithdraw = 'poolOwnerVulnWarningGovernanceWithdraw',
  PoolOwnerVulnWarningGovernance = 'poolOwnerVulnWarningGovernance',
  PoolOwnerVulnWarningEcosystem = 'poolOwnerVulnWarningEcosystem',
  PoolOwnerVulnWarningEcosystemMigrate = 'poolOwnerVulnWarningEcosystemMigrate',
  RenBTCWarning = 'renBTCWarning',
  EulerBoostedWarning = 'eulerBoostedWarning',
  EulerRecoveryModeWarning = 'eulerRecoveryModeWarning',
  CspPoolVulnWarning = 'cspPoolVulnWarning',
  FxPoolVulnWarning = 'fxPoolVulnWarning',
}
