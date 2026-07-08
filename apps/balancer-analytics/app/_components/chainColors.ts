// Brand colors per supported chain. Values match the wallet/explorer
// conventions used across the rest of the monorepo.
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export const CHAIN_COLORS: Partial<Record<GqlChain, string>> = {
  MAINNET: '#627EEA',
  ARBITRUM: '#28A0F0',
  BASE: '#0052FF',
  POLYGON: '#8247E5',
  GNOSIS: '#3E6957',
  AVALANCHE: '#E84142',
  OPTIMISM: '#FF0420',
  FRAXTAL: '#000000',
  MODE: '#DFFE00',
  ZKEVM: '#9B7BFF',
  SEPOLIA: '#A0AEC0',
}
