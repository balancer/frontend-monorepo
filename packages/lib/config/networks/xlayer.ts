import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import { convertHexToLowerCase } from '@repo/lib/shared/utils/objects'
import { CSP_ISSUE_POOL_IDS } from '@repo/lib/shared/data/csp-issue'
import { PoolIssue } from '@repo/lib/modules/pool/alerts/pool-issues/PoolIssue.type'
import { PERMIT2, NATIVE_ASSETS, ChainId, CHAINS, AddressProvider } from '@balancer/sdk'
import { zeroAddress } from 'viem'

const chainId = ChainId.X_LAYER

// name, symbol & wrapped are always defined in the sdk
const nativeAsset = NATIVE_ASSETS[chainId]

// blockExplorers is always defined in the sdk
const chain = CHAINS[chainId]

const networkConfig: NetworkConfig = {
  chainId,
  name: chain.name,
  shortName: chain.name,
  chain: GqlChain.Xlayer,
  iconPath: '/images/chains/XLAYER.svg',
  blockExplorer: {
    baseUrl: chain.blockExplorers!.default.url,
    name: chain.blockExplorers!.default.name,
  },
  tokens: {
    addresses: {
      bal: zeroAddress,
      wNativeAsset: nativeAsset.wrapped!,
    },
    nativeAsset: {
      name: nativeAsset.name!,
      address: nativeAsset.address,
      symbol: nativeAsset.symbol!,
      decimals: nativeAsset.decimals,
    },
    defaultSwapTokens: {
      tokenIn: nativeAsset.address,
    },
    popularTokens: {
      [nativeAsset.address]: nativeAsset.symbol!,
      [nativeAsset.wrapped!]: `W${nativeAsset.symbol!}`,
      '0x1e4a5963abfd975d8c9021ce480b42188849d41d': 'USDT',
      '0x779ded0c9e1022225f8e0630b35a9b54be713736': 'USDT0',
      '0x74b7f16337b8972027f6196a17a631ac6de26d22': 'USDC',
      '0x5a77f1443d16ee5761d310e38b62f77f726bc71c': 'WETH',
      '0x4ae46a509f6b1d9056937ba4500cb143933d2dc8': 'USDG',
    },
  },
  contracts: {
    multicall2: zeroAddress,
    multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11',
    balancer: {
      vaultV2: zeroAddress,
      vaultV3: AddressProvider.Vault(chainId),
      relayerV6: zeroAddress,
      minter: zeroAddress,
      router: AddressProvider.Router(chainId),
      batchRouter: AddressProvider.BatchRouter(chainId),
      compositeLiquidityRouterBoosted: AddressProvider.CompositeLiquidityRouter(chainId),
      vaultAdminV3: AddressProvider.VaultAdmin(chainId),
    },
    permit2: PERMIT2[chainId],
  },
  pools: convertHexToLowerCase({
    issues: { [PoolIssue.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[GqlChain.Xlayer] },
  }),
  supportsVeBalSync: false,
}

export default networkConfig
