import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import { convertHexToLowerCase } from '@/lib/shared/utils/objects'

const networkConfig: NetworkConfig = {
  chainId: 8453,
  name: 'Base Mainnet',
  shortName: 'Base',
  chain: GqlChain.Base,
  iconPath: '/images/chains/BASE.svg',
  blockExplorer: {
    baseUrl: 'https://basescan.org',
    name: 'BaseScan',
  },
  tokens: {
    addresses: {
      bal: '0x4158734d47fc9692176b5085e0f52ee0da5d47f1',
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
      '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'USDC',
      '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca': 'USDbC',
      '0x4158734d47fc9692176b5085e0f52ee0da5d47f1': 'BAL',
      '0xb6fe221fe9eef5aba221c348ba20a1bf5e73624c': 'rETH',
      '0xbefd5c25a59ef2c1316c5a4944931171f30cd3e4': 'GOLD',
      '0x1509706a6c66ca549ff0cb464de88231ddbe213b': 'AURA',
      '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': 'DAI',
      '0x54330d28ca3357f294334bdc454a032e7f353416': 'OLAS',
    },
  },
  contracts: {
    multicall2: '0xca11bde05977b3631167028862be2a173976ca11',
    balancer: {
      vaultV2: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      relayerV6: '0x7C3C773C878d2238a9b64d8CEE02377BF07ED06a',
      minter: '0x0c5538098EBe88175078972F514C9e101D325D4F',
    },
    veDelegationProxy: '0xD87F44Df0159DC78029AB9CA7D7e57E7249F5ACD',
  },
  pools: convertHexToLowerCase({ issues: {} }),
}

export default networkConfig
