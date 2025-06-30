import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import { convertHexToLowerCase } from '@repo/lib/shared/utils/objects'
import { PoolIssue } from '@repo/lib/modules/pool/alerts/pool-issues/PoolIssue.type'
import { CSP_ISSUE_POOL_IDS } from '@repo/lib/shared/data/csp-issue'
import { AddressProvider, PERMIT2 } from '@balancer/sdk'
import { zeroAddress } from 'viem'
import { hyperEvm } from '@repo/lib/modules/chains/custom/hyperevm'

const NOT_USED = zeroAddress

const networkConfig: NetworkConfig = {
  chainId: hyperEvm.id,
  name: hyperEvm.name,
  shortName: hyperEvm.name,
  chain: GqlChain.Hyperevm,
  iconPath: '/images/chains/HYPEREVM.svg',
  blockExplorer: {
    baseUrl: 'https://hyperevmscan.io/',
    name: 'Hyperscan',
  },
  tokens: {
    addresses: {
      bal: zeroAddress,
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
    multicall2: NOT_USED,
    multicall3: hyperEvm.contracts.multicall3.address,
    balancer: {
      vaultV2: NOT_USED,
      vaultV3: AddressProvider.Vault(hyperEvm.id),
      relayerV6: NOT_USED,
      minter: NOT_USED,
      router: AddressProvider.Router(hyperEvm.id),
      compositeLiquidityRouterBoosted: AddressProvider.CompositeLiquidityRouter(hyperEvm.id),
    },
    veDelegationProxy: NOT_USED,
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
