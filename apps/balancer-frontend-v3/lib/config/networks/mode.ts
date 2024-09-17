import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import { convertHexToLowerCase } from '@/lib/shared/utils/objects'
import { CSP_ISSUE_POOL_IDS } from '@/lib/shared/data/csp-issue'
import { PoolIssue } from '@/lib/modules/pool/alerts/pool-issues/PoolIssue.type'

const networkConfig: NetworkConfig = {
  chainId: 34443,
  name: 'Mode',
  shortName: 'Mode',
  chain: GqlChain.Mode,
  iconPath: '/images/chains/MODE.svg',
  blockExplorer: {
    baseUrl: 'https://modescan.io',
    name: 'Modescan',
  },
  tokens: {
    addresses: {
      bal: '0xD08a2917653d4E460893203471f0000826fb4034',
      wNativeAsset: '0x4200000000000000000000000000000000000006',
    },
    nativeAsset: {
      name: 'Ether',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      symbol: 'ETH',
      decimals: 18,
    },
    defaultSwapTokens: {
      tokenIn: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    popularTokens: {
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': 'ETH',
      '0x4200000000000000000000000000000000000006': 'WETH',
    },
  },
  contracts: {
    multicall2: '0xca11bde05977b3631167028862be2a173976ca11', // TODO: this is v3, check if it works
    balancer: {
      vaultV2: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      relayerV6: '0xb541765F540447646A9545E0A4800A0Bacf9E13D',
      minter: '0x5cF4928a3205728bd12830E1840F7DB85c62a4B9',
    },
    veDelegationProxy: '0x9805dcfD25e6De36bad8fe9D3Fe2c9b44B764102',
  },
  pools: convertHexToLowerCase({
    issues: {
      [PoolIssue.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[GqlChain.Mode],
    },
  }),
}

export default networkConfig
