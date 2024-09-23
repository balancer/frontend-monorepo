import { PoolIssue } from '@/lib/modules/pool/alerts/pool-issues/PoolIssue.type'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { convertHexToLowerCase } from '@/lib/shared/utils/objects'
import { NetworkConfig } from '../config.types'
import { CSP_ISSUE_POOL_IDS } from '../../shared/data/csp-issue'
import { SupportedWrapHandler } from '@/lib/modules/swap/swap.types'

const networkConfig = {
  chainId: 1,
  name: 'Ethereum Mainnet',
  shortName: 'Ethereum',
  chain: GqlChain.Mainnet,
  iconPath: '/images/chains/MAINNET.svg',
  blockExplorer: {
    baseUrl: 'https://etherscan.io',
    name: 'Etherscan',
  },
  tokens: {
    addresses: {
      veBalBpt: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
      bal: '0xba100000625a3754423978a60c9317c58a424e3d',
      wNativeAsset: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      auraBal: '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d',
    },
    nativeAsset: {
      name: 'Ether',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      symbol: 'ETH',
      decimals: 18,
    },
    supportedWrappers: [
      {
        // stETH/wstETH
        baseToken: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        wrappedToken: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
        swapHandler: SupportedWrapHandler.LIDO,
      },
    ],
    /**
     * The approval function for these tokens doesn't allow setting a new approval
     * level if the current level is > 0. Thus they must be approved in two steps
     * first setting to 0 then setting to the required amount.
     */
    doubleApprovalRequired: [
      '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
      '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c', // ENJ
    ],
    defaultSwapTokens: {
      tokenIn: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    popularTokens: {
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': 'ETH',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 'WETH',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'USDC',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'DAI',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT',
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': 'WBTC',
      '0xba100000625a3754423978a60c9317c58a424e3D': 'BAL',
      '0xc0c293ce456ff0ed870add98a0828dd4d2903dbf': 'AURA',
      '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d': 'auraBAL',
      '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56': 'B-80BAL-20WETH',
      '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': 'wstETH',
      '0xae78736cd615f374d3085123a210448e74fc6393': 'rETH',
      '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'AAVE',
      '0xbf5495efe5db9ce00f80364c8b423567e58d2110': 'ezETH',
      '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee': 'weETH',
      '0xfae103dc9cf190ed75350761e95403b7b8afa6c0': 'rswETH',
      '0xe07f9d810a48ab5c3c914ba3ca53af14e4491e8a': 'GYD',
      '0x6810e776880c02933d47db1b9fc05908e5386b96': 'GNO',
      '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f': 'GHO',
    },
  },
  contracts: {
    multicall2: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
    balancer: {
      vaultV2: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      relayerV6: '0x35Cea9e57A393ac66Aaa7E25C391D52C74B5648f',
      minter: '0x239e55F427D44C3cc793f49bFB507ebe76638a2b',
    },
    feeDistributor: '0xD3cf852898b21fc233251427c2DC93d3d604F3BB',
    veDelegationProxy: '0x6f5a2eE11E7a772AeB5114A20d0D7c0ff61EB8A0',
    veBAL: '0xC128a9954e6c874eA3d62ce62B468bA073093F25',
  },

  pools: convertHexToLowerCase({
    issues: {
      [PoolIssue.PoolProtocolFeeVulnWarning]: [
        '0x5b3240b6be3e7487d61cd1afdfc7fe4fa1d81e6400000000000000000000037b',
      ],
      [PoolIssue.PoolOwnerVulnWarningGovernanceMigrate]: [
        '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000063',
      ],
      [PoolIssue.PoolOwnerVulnWarningGovernanceWithdraw]: [
        '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe',
      ],
      [PoolIssue.PoolOwnerVulnWarningGovernance]: [
        '0x9f19a375709baf0e8e35c2c5c65aca676c4c719100000000000000000000006e',
      ],
      [PoolIssue.PoolOwnerVulnWarningEcosystem]: [
        '0xe7b1d394f3b40abeaa0b64a545dbcf89da1ecb3f00010000000000000000009a',
        '0x3b40d7d5ae25df2561944dd68b252016c4c7b2800001000000000000000000c2',
        '0xccf5575570fac94cec733a58ff91bb3d073085c70002000000000000000000af',
      ],
      [PoolIssue.RenBTCWarning]: [
        '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc56000000000000000000000066',
        '0xad6a8c18b62eb914604ec1eec7fbcf132799fe090001000000000000000003f6',
      ],
      [PoolIssue.EulerBoostedWarning]: [
        '0x50cf90b954958480b8df7958a9e965752f62712400000000000000000000046f',
      ],
      [PoolIssue.EulerRecoveryModeWarning]: [
        '0x133d241f225750d2c92948e464a5a80111920331000000000000000000000476',
        '0x00c2a4be503869fa751c2dbcb7156cc970b5a8da000000000000000000000477',
        '0x483006684f422a9448023b2382615c57c5ecf18f000000000000000000000488',
        '0xb5e3de837f869b0248825e0175da73d4e8c3db6b000200000000000000000474',
        '0xa718042e5622099e5f0ace4e7122058ab39e1bbe000200000000000000000475',
        '0x4fd4687ec38220f805b6363c3c1e52d0df3b5023000200000000000000000473',
      ],
      [PoolIssue.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[GqlChain.Mainnet],
      [PoolIssue.FxPoolVulnWarning]: [
        '0x55bec22f8f6c69137ceaf284d9b441db1b9bfedc0002000000000000000003cd',
        '0x66bb9d104c55861feb3ec3559433f01f6373c9660002000000000000000003cf',
        '0xad0e5e0778cac28f1ff459602b31351871b5754a0002000000000000000003cD',
      ],
    },
    allowNestedActions: [
      '0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0', // B-80BAL-20WETH
    ],
  }),
} as const satisfies NetworkConfig

export default networkConfig
