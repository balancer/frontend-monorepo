import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import { convertHexToLowerCase } from '@/lib/shared/utils/objects'
import { PoolIssue } from '@/lib/modules/pool/alerts/pool-issues/PoolIssue.type'
import { CSP_ISSUE_POOL_IDS } from '@/lib/shared/data/csp-issue'

const networkConfig: NetworkConfig = {
  chainId: 42161,
  name: 'Arbitrum One',
  shortName: 'Arbitrum',
  chain: GqlChain.Arbitrum,
  iconPath: '/images/chains/ARBITRUM.svg',
  blockExplorer: {
    baseUrl: 'https://arbiscan.io',
    name: 'Arbiscan',
  },
  tokens: {
    addresses: {
      bal: '0x040d1edc9569d4bab2d15287dc5a4f10f56a56b8',
      wNativeAsset: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
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
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': 'WETH',
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': 'USDC',
      '0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8': 'PENDLE',
      '0x5979D7b546E38E414F7E9822514be443A4800529': 'wstETH',
      '0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe': 'weETH',
      '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a': 'GMX',
      '0x3082CC23568eA640225c2467653dB90e9250AaA0': 'RDNT',
      '0x2416092f143378750bb29b79eD961ab195CcEea5': 'ezETH',
      '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': 'DAI',
      '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': 'USDT',
      '0x1debd73e752beaf79865fd6446b0c970eae7732f': 'cbETH',
      '0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8': 'rETH',
      '0x040d1edc9569d4bab2d15287dc5a4f10f56a56b8': 'BAL',
      '0x1509706a6c66ca549ff0cb464de88231ddbe213b': 'AURA',
    },
  },
  contracts: {
    multicall2: '0x80c7dd17b01855a6d2347444a0fcc36136a314de',
    balancer: {
      vaultV2: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      relayerV6: '0x9B892E515D2Ab8869F17488d64B3b918731cc70d',
      minter: '0xc3ccacE87f6d3A81724075ADcb5ddd85a8A1bB68',
    },
    veDelegationProxy: '0x81cFAE226343B24BA12EC6521Db2C79E7aeeb310',
  },
  pools: convertHexToLowerCase({
    issues: {
      [PoolIssue.PoolOwnerVulnWarningGovernance]: [
        '0x5a5884fc31948d59df2aeccca143de900d49e1a300000000000000000000006f',
      ],
      [PoolIssue.PoolOwnerVulnWarningEcosystem]: [
        '0x0510ccf9eb3ab03c1508d3b9769e8ee2cfd6fdcf00000000000000000000005d',
      ],
      [PoolIssue.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[GqlChain.Arbitrum],
    },
  }),
}

export default networkConfig
