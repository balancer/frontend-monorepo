import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import { convertHexToLowerCase } from '@/lib/shared/utils/objects'
import { CSP_ISSUE_POOL_IDS } from '@/lib/shared/data/csp-issue'
import { PoolIssue } from '@/lib/modules/pool/alerts/pool-issues/PoolIssue.type'

const networkConfig: NetworkConfig = {
  chainId: 100,
  name: 'Gnosis Chain',
  shortName: 'Gnosis',
  chain: GqlChain.Gnosis,
  iconPath: '/images/chains/GNOSIS.svg',
  blockExplorer: {
    baseUrl: 'https://gnosisscan.io',
    name: 'GnosisScan',
  },
  tokens: {
    addresses: {
      bal: '0x7ef541e2a22058048904fe5744f9c7e4c57af717',
      wNativeAsset: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
    },
    nativeAsset: {
      name: 'xDAI',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      symbol: 'xDAI',
      decimals: 18,
    },
    defaultSwapTokens: {
      tokenIn: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    popularTokens: {
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': 'xDAI',
      '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d': 'WXDAI',
      '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1': 'WETH',
      '0x6c76971f98945ae98dd7d4dfca8711ebea946ea6': 'wsETH',
      '0x9c58bacc331c9aa871afd802db6379a98e80cedb': 'GNO',
      '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83': 'USDC',
      '0x7ef541e2a22058048904fe5744f9c7e4c57af717': 'BAL',
      '0x4ecaba5870353805a9f068101a40e0f32ed605c6': 'USDT',
      '0xaf204776c7245bf4147c2612bf6e5972ee483701': 'sDAI',
      '0xcb444e90d8198415266c6a2724b7900fb12fc56e': 'EURe',
      '0xce11e14225575945b8e6dc0d4f2dd4c570f79d9f': 'OLAS',
      '0x177127622c4a00f3d409b75571e12cb3c8973d3c': 'COW',
      '0x4d18815d14fe5c3304e87b3fa18318baa5c23820': 'SAFE',
      '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252': 'WBTC',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'DAI',
      '0x1509706a6c66ca549ff0cb464de88231ddbe213b': 'AURA',
    },
  },
  contracts: {
    multicall2: '0xbb6fab6b627947dae0a75808250d8b2652952cb5',
    balancer: {
      vaultV2: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      relayerV6: '0x2163c2FcD0940e84B8a68991bF926eDfB0Cd926C',
      minter: '0xA8920455934Da4D853faac1f94Fe7bEf72943eF1',
    },
    veDelegationProxy: '0x7A2535f5fB47b8e44c02Ef5D9990588313fe8F05',
  },
  pools: convertHexToLowerCase({
    issues: { [PoolIssue.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[GqlChain.Gnosis] },
    allowNestedActions: ['0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053'],
  }),
}

export default networkConfig
