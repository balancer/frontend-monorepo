import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import { convertHexToLowerCase } from '@/lib/shared/utils/objects'
import { CSP_ISSUE_POOL_IDS } from '@/lib/shared/data/csp-issue'
import { PoolIssue } from '@/lib/modules/pool/alerts/pool-issues/PoolIssue.type'

const networkConfig: NetworkConfig = {
  chainId: 10,
  name: 'Optimism Mainnet',
  shortName: 'Optimism',
  chain: GqlChain.Optimism,
  iconPath: '/images/chains/OPTIMISM.svg',
  blockExplorer: {
    baseUrl: 'https://optimistic.etherscan.io',
    name: 'Etherscan',
  },
  tokens: {
    addresses: {
      bal: '0xfe8b128ba8c78aabc59d4c64cee7ff28e9379921',
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
      '0x7f5c764cbc14f9669b88837ca1490cca17c31607': 'USDC.e',
      '0x68f180fcce6836688e9084f035309e29bf0a2095': 'WBTC',
      '0x4200000000000000000000000000000000000042': 'OP',
      '0x1f32b1c2345538c0c6f582fcb022739c4a194ebb': 'wstETH',
      '0x0b2c639c533813f4aa9d7837caf62653d097ff85': 'USDC',
      '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58': 'USDT',
      '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': 'DAI',
      '0x97513e975a7fa9072c72c92d8000b0db90b163c5': 'multiBEETS',
      '0xb4bc46bc6cb217b59ea8f4530bae26bf69f677f0': 'BEETS',
      '0xfe8b128ba8c78aabc59d4c64cee7ff28e9379921': 'BAL',
      '0x1509706a6c66ca549ff0cb464de88231ddbe213b': 'AURA',
    },
  },
  contracts: {
    multicall2: '0x2dc0e2aa608532da689e89e237df582b783e552c',
    balancer: {
      vaultV2: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      relayerV6: '0x015ACA20a1422F3c729086c17f15F10e0CfbC75A',
      minter: '0x4fb47126Fa83A8734991E41B942Ac29A3266C968',
    },
    veDelegationProxy: '0x9dA18982a33FD0c7051B19F0d7C76F2d5E7e017c',
  },
  pools: convertHexToLowerCase({
    issues: {
      [PoolIssue.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[GqlChain.Optimism],
    },
  }),
}

export default networkConfig
