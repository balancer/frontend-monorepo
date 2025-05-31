import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import { convertHexToLowerCase } from '@repo/lib/shared/utils/objects'
import { balancerV3Contracts, PERMIT2 } from '@balancer/sdk'
import { sepolia } from 'viem/chains'

const networkConfig: NetworkConfig = {
  chainId: 11155111,
  name: 'Ethereum Testnet Sepolia',
  shortName: 'Sepolia',
  chain: GqlChain.Sepolia,
  iconPath: '/images/chains/MAINNET.svg',
  blockExplorer: {
    baseUrl: 'https://sepolia.etherscan.io',
    name: 'Etherscan',
  },
  tokens: {
    addresses: {
      bal: '0xb19382073c7a0addbb56ac6af1808fa49e377b75',
      wNativeAsset: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    },
    nativeAsset: {
      name: 'Ether',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      symbol: 'ETH',
      decimals: 18,
    },
    doubleApprovalRequired: [
      '0x6bf294b80c7d8dc72dee762af5d01260b756a051', // USDT
    ],
    defaultSwapTokens: {
      tokenIn: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
  },
  contracts: {
    multicall2: '0xca11bde05977b3631167028862be2a173976ca11',
    balancer: {
      vaultV2: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      vaultV3: balancerV3Contracts.Vault[sepolia.id],
      router: balancerV3Contracts.Router[sepolia.id],
      batchRouter: balancerV3Contracts.BatchRouter[sepolia.id],
      compositeLiquidityRouterBoosted: balancerV3Contracts.CompositeLiquidityRouter[sepolia.id],
      relayerV6: '0x7852fB9d0895e6e8b3EedA553c03F6e2F9124dF9',
      minter: '0x1783Cd84b3d01854A96B4eD5843753C2CcbD574A',
      vaultAdminV3: balancerV3Contracts.VaultAdmin[sepolia.id],
    },
    veBAL: '0x150A72e4D4d81BbF045565E232c50Ed0931ad795',
    permit2: PERMIT2[sepolia.id],
  },
  pools: convertHexToLowerCase({
    issues: {},
    disallowNestedActions: [],
  }),
  layerZeroChainId: 10161,
  lbps: {
    collateralTokens: [
      '0x7b79995e5f793a07bc00c21412e50ecae098e7f9', // WETH
      '0x80d6d3946ed8a1da4e226aa21ccddc32bd127d1a', // USDC
      '0x6bf294b80c7d8dc72dee762af5d01260b756a051', // USDT
    ],
  },
}

export default networkConfig
