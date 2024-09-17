import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import { convertHexToLowerCase } from '@/lib/shared/utils/objects'
import { PoolIssue } from '@/lib/modules/pool/alerts/pool-issues/PoolIssue.type'
import { CSP_ISSUE_POOL_IDS } from '@/lib/shared/data/csp-issue'

const networkConfig: NetworkConfig = {
  chainId: 43114,
  name: 'Avalanche Mainnet',
  shortName: 'Avalanche',
  chain: GqlChain.Avalanche,
  iconPath: '/images/chains/AVALANCHE.svg',
  blockExplorer: {
    baseUrl: 'https://snowtrace.io',
    name: 'Snowtrace',
  },
  tokens: {
    addresses: {
      bal: '0xe15bcb9e0ea69e6ab9fa080c4c4a5632896298c3',
      wNativeAsset: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    },
    nativeAsset: {
      name: 'Avalanche',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      symbol: 'AVAX',
      decimals: 18,
    },
    defaultSwapTokens: {
      tokenIn: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    popularTokens: {
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': 'AVAX',
      '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7': 'WAVAX',
      '0xa25eaf2906fa1a3a13edac9b9657108af7b703e3': 'ggAVAX',
      '0xe15bcb9e0ea69e6ab9fa080c4c4a5632896298c3': 'BAL',
      '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7': 'USDt',
      '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e': 'USDC',
      '0x152b9d0fdc40c096757f570a51e494bd4b943e50': 'BTC.b',
    },
  },
  contracts: {
    multicall2: '0xca11bde05977b3631167028862be2a173976ca11',
    balancer: {
      vaultV2: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      relayerV6: '0xA084c11cb55e67C9becf9607f1DBB20ec4D5E7b2',
      minter: '0x85a80afee867aDf27B50BdB7b76DA70f1E853062',
    },
    veDelegationProxy: '0x0c6052254551EAe3ECac77B01DFcf1025418828f',
  },
  pools: convertHexToLowerCase({
    issues: {
      [PoolIssue.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[GqlChain.Avalanche],
      [PoolIssue.FxPoolVulnWarning]: [
        '0x55bec22f8f6c69137ceaf284d9b441db1b9bfedc000200000000000000000011',
        '0x66bb9d104c55861feb3ec3559433f01f6373c96600020000000000000000002a',
        '0xad0e5e0778cac28f1ff459602b31351871b5754a000200000000000000000029',
      ],
    },
  }),
}

export default networkConfig
