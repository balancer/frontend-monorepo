import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import { convertHexToLowerCase } from '@repo/lib/shared/utils/objects'
import { CSP_ISSUE_POOL_IDS } from '@repo/lib/shared/data/csp-issue'
import { PoolIssue } from '@repo/lib/modules/pool/alerts/pool-issues/PoolIssue.type'
import { PERMIT2, NATIVE_ASSETS, ChainId, CHAINS, AddressProvider } from '@balancer/sdk'
import { zeroAddress } from 'viem'

const chainId = ChainId.GNOSIS_CHAIN

// name, symbol & wrapped are always defined in the sdk
const nativeAsset = NATIVE_ASSETS[chainId]

// blockExplorers is always defined in the sdk
const chain = CHAINS[chainId]

const networkConfig: NetworkConfig = {
  chainId,
  name: chain.name,
  shortName: chain.name,
  // TODO: update
  chain: GqlChain.Gnosis,
  // chain: GqlChain.Plasma,
  iconPath: '/images/chains/PLASMA.svg',
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
      '0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb': 'USDT0',
      '0x9895d81bb462a195b4922ed7de0e3acd007c32cb': 'WETH',
    },
  },
  // TODO: update addresses
  contracts: {
    multicall2: zeroAddress,
    multicall3: '0xca11bde05977b3631167028862be2a173976ca11', // TODO: add to viem
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
    veDelegationProxy: zeroAddress,
    permit2: PERMIT2[chainId],
  },
  pools: convertHexToLowerCase({
    // TODO: update (also CSP_ISSUE_POOL_IDS)
    issues: { [PoolIssue.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[GqlChain.Gnosis] },
    // issues: { [PoolIssue.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[GqlChain.Plasma] },
  }),
  layerZeroChainId: 145, // TODO: update
  supportsVeBalSync: false, // TODO: update
}

export default networkConfig
