import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import { convertHexToLowerCase } from '@repo/lib/shared/utils/objects'
import { CSP_ISSUE_POOL_IDS } from '@repo/lib/shared/data/csp-issue'
import { PoolIssue } from '@repo/lib/modules/pool/alerts/pool-issues/PoolIssue.type'
import { BALANCER_COMPOSITE_LIQUIDITY_ROUTER, BALANCER_ROUTER } from '@balancer/sdk'
import { fraxtal } from 'viem/chains'

const networkConfig: NetworkConfig = {
  chainId: 252,
  name: 'Fraxtal',
  shortName: 'Fraxtal',
  chain: GqlChain.Fraxtal,
  iconPath: '/images/chains/FRAXTAL.svg',
  blockExplorer: {
    baseUrl: 'https://fraxscan.com',
    name: 'Fraxscan',
  },
  tokens: {
    addresses: {
      bal: '0x2FC7447F6cF71f9aa9E7FF8814B37E55b268Ec91',
      wNativeAsset: '0xFC00000000000000000000000000000000000006',
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
      '0xFC00000000000000000000000000000000000006': 'WETH',
    },
  },
  contracts: {
    multicall2: '0xca11bde05977b3631167028862be2a173976ca11', // TODO: this is v3, check if it works
    balancer: {
      vaultV2: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      relayerV6: '0xb541765F540447646A9545E0A4800A0Bacf9E13D',
      minter: '0x9805dcfD25e6De36bad8fe9D3Fe2c9b44B764102',
      router: BALANCER_ROUTER[fraxtal.id],
      compositeLiquidityRouter: BALANCER_COMPOSITE_LIQUIDITY_ROUTER[fraxtal.id],
    },
    veDelegationProxy: '0xE3881627B8DeeBCCF9c23B291430a549Fc0bE5F7',
  },
  pools: convertHexToLowerCase({
    issues: {
      [PoolIssue.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[GqlChain.Fraxtal],
    },
  }),
  layerZeroChainId: 255,
  supportsVeBalSync: true,
}

export default networkConfig
