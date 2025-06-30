import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import { convertHexToLowerCase } from '@repo/lib/shared/utils/objects'
import { PoolIssue } from '@repo/lib/modules/pool/alerts/pool-issues/PoolIssue.type'
import { CSP_ISSUE_POOL_IDS } from '@repo/lib/shared/data/csp-issue'
import { balancerV3Contracts, PERMIT2 } from '@balancer/sdk'
import { hyperEvm } from '@repo/lib/modules/chains/custom/hyperevm'

const networkConfig: NetworkConfig = {
  chainId: hyperEvm.id,
  name: 'HyperEVM',
  shortName: 'HyperEVM',
  chain: GqlChain.Hyperevm,
  iconPath: '/images/chains/HYPEREVM.svg',
  blockExplorer: {
    baseUrl: 'https://www.hyperscan.com/',
    name: 'Hyperscan',
  },
  tokens: {
    addresses: {
      bal: '0x0000000000000000000000000000000000000000',
      wNativeAsset: '0x5555555555555555555555555555555555555555',
    },
    nativeAsset: {
      name: 'HYPE',
      address: '0x2222222222222222222222222222222222222222',
      symbol: 'HYPE',
      decimals: 18,
    },
    defaultSwapTokens: {
      tokenIn: '0x2222222222222222222222222222222222222222',
    },
    popularTokens: {
      '0x2222222222222222222222222222222222222222': 'HYPE',
      '0x0000000000000000000000000000000000000000': 'BAL',
      '0xbF2D3b1a37D54ce86d0e1455884dA875a97C87a8': 'USDt',
      '0x69f8AFbC9DE9fD819eC78eDc553488a6B4269938': 'USDC',
    },
  },
  contracts: {
    multicall2: '0x0000000000000000000000000000000000000000',
    multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11',
    balancer: {
      vaultV2: '0x0000000000000000000000000000000000000000',
      vaultV3: balancerV3Contracts.Vault[hyperEvm.id],
      relayerV6: '0x0000000000000000000000000000000000000000',
      minter: '0x0000000000000000000000000000000000000000',
      router: balancerV3Contracts.Router[hyperEvm.id],
      compositeLiquidityRouterBoosted: balancerV3Contracts.CompositeLiquidityRouter[hyperEvm.id],
    },
    veDelegationProxy: '0x0000000000000000000000000000000000000000',
    permit2: PERMIT2[hyperEvm.id],
  },
  pools: convertHexToLowerCase({
    issues: {
      [PoolIssue.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[GqlChain.Hyperevm],
      [PoolIssue.FxPoolVulnWarning]: [],
    },
  }),
  layerZeroChainId: 367,
  supportsVeBalSync: false,
  lbps: {
    collateralTokens: [
      '0x5555555555555555555555555555555555555555', // wHYPE
      '0x69f8AFbC9DE9fD819eC78eDc553488a6B4269938', // USDC
    ],
  },
}

export default networkConfig
