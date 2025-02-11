import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import { Address, zeroAddress } from 'viem'
import { convertHexToLowerCase } from '@repo/lib/shared/utils/objects'
import { emptyAddress } from '@repo/lib/modules/web3/contracts/wagmi-helpers'
import {
  BALANCER_BATCH_ROUTER,
  BALANCER_COMPOSITE_LIQUIDITY_ROUTER,
  PERMIT2,
  VAULT_ADMIN,
  VAULT_V3,
} from '@balancer/sdk'
import { sonic } from 'viem/chains'

const networkConfig: NetworkConfig = {
  chainId: 146,
  name: 'Sonic',
  shortName: 'Sonic',
  chain: GqlChain.Sonic,
  iconPath: '/images/chains/SONIC.svg',
  blockExplorer: {
    baseUrl: 'https://sonicscan.org',
    name: 'SonicScan',
  },
  tokens: {
    addresses: {
      bal: emptyAddress,
      beets: '0x2d0e0814e62d80056181f5cd932274405966e4f0',
      wNativeAsset: '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38',
    },
    nativeAsset: {
      name: 'Sonic',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      symbol: 'S',
      decimals: 18,
    },
    stakedAsset: {
      name: 'Beets Staked Sonic',
      address: '0xe5da20f15420ad15de0fa650600afc998bbe3955',
      symbol: 'stS',
      decimals: 18,
    },
    defaultSwapTokens: {
      tokenIn: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    popularTokens: {
      '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38': 'wS',
      '0xe5da20f15420ad15de0fa650600afc998bbe3955': 'stS',
      '0x2d0e0814e62d80056181f5cd932274405966e4f0': 'BEETS',
      '0x29219dd400f2bf60e5a23d13be72b486d4038894': 'USDC.e',
      '0xd3dce716f3ef535c5ff8d041c1a41c3bd89b97ae': 'scUSD',
    },
  },
  contracts: {
    multicall2: '0xc07500b9fe7bea9efd5b54341d0aa3658a33d39a',
    multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11',
    balancer: {
      vaultV2: '0xba12222222228d8ba445958a75a0704d566bf2c8',
      vaultV3: VAULT_V3[sonic.id],
      relayerV6: '0x7b52D5ef006E59e3227629f97F182D6442380bb6',
      minter: zeroAddress,
      router: '0xNotYetAvailable' as Address,
      batchRouter: BALANCER_BATCH_ROUTER[sonic.id],
      compositeLiquidityRouter: BALANCER_COMPOSITE_LIQUIDITY_ROUTER[sonic.id],
      vaultAdminV3: VAULT_ADMIN[sonic.id],
    },
    veDelegationProxy: zeroAddress, // TODO: fix this dependency for Beets
    beets: {
      lstStaking: '0xd5f7fc8ba92756a34693baa386edcc8dd5b3f141',
      lstStakingProxy: '0xe5da20f15420ad15de0fa650600afc998bbe3955',
      sfcProxy: '0xFC00FACE00000000000000000000000000000000',
      sfc: '0x0aB8f3b709A52c096f33702fE8153776472305ed',
      lstWithdrawRequestHelper: '0x52b16e3d7d25ba64f242e59f9a74799ecc432d78',
      reliquary: '0x973670ce19594f857a7cd85ee834c7a74a941684',
    },
    permit2: PERMIT2[sonic.id],
  },
  pools: convertHexToLowerCase({ issues: {} }),
}

export default networkConfig
