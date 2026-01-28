import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { convertHexToLowerCase } from '@repo/lib/shared/utils/objects'
import { CSP_ISSUE_POOL_IDS } from '@repo/lib/shared/data/csp-issue'
import { PoolIssue } from '@repo/lib/modules/pool/alerts/pool-issues/PoolIssue.type'
import { PERMIT2, NATIVE_ASSETS, ChainId, AddressProvider } from '@balancer/sdk'
import { zeroAddress } from 'viem'
import { monad } from 'viem/chains'
import type { NetworkConfig } from '../config.types'

const chainId = ChainId.MONAD

const nativeAsset = NATIVE_ASSETS[chainId]

const networkConfig: NetworkConfig = {
  chainId,
  name: monad.name,
  shortName: monad.name,
  chain: GqlChain.Monad,
  iconPath: '/images/chains/MONAD.svg',
  blockExplorer: {
    baseUrl: monad.blockExplorers.default.url,
    name: monad.blockExplorers.default.name,
  },
  tokens: {
    addresses: {
      bal: zeroAddress,
      wNativeAsset: nativeAsset.wrapped,
    },
    nativeAsset: {
      name: monad.nativeCurrency.name,
      address: nativeAsset.address,
      symbol: monad.nativeCurrency.symbol,
      decimals: monad.nativeCurrency.decimals,
    },
    defaultSwapTokens: {
      tokenIn: nativeAsset.address,
    },
    popularTokens: {
      [nativeAsset.address]: monad.nativeCurrency.symbol,
      [nativeAsset.wrapped]: `W${monad.nativeCurrency.symbol}`,
      '0xe7cd86e13ac4309349f30b3435a9d337750fc82d': 'USDT0',
      '0x74b7f16337b8972027f6196a17a631ac6de26d22': 'USDC',
      '0xee8c0e9f1bffb4eb878d8f15f368a02a35481242': 'WETH',
      '0x10aeaf63194db8d453d4d85a06e5efe1dd0b5417': 'WSTETH',
      '0x0555e30da8f98308edb960aa94c0db47230d2b9c': 'WBTC',
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
    issues: { [PoolIssue.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[GqlChain.Monad] },
  }),
  supportsVeBalSync: false,
}

export default networkConfig
