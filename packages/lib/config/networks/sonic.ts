import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import { zeroAddress } from 'viem'
import { convertHexToLowerCase } from '@repo/lib/shared/utils/objects'
import { emptyAddress } from '@repo/lib/modules/web3/contracts/wagmi-helpers'

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
  },
  contracts: {
    multicall2: '0xc07500b9fe7bea9efd5b54341d0aa3658a33d39a',
    multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11',
    balancer: {
      vaultV2: '0xba12222222228d8ba445958a75a0704d566bf2c8',
      relayerV6: '0x7b52D5ef006E59e3227629f97F182D6442380bb6',
      minter: zeroAddress,
    },
    veDelegationProxy: zeroAddress, // TODO: fix this dependency for Beets
    beets: {
      lstStaking: '0xd5f7fc8ba92756a34693baa386edcc8dd5b3f141',
      lstStakingProxy: '0xe5da20f15420ad15de0fa650600afc998bbe3955',
    },
  },
  pools: convertHexToLowerCase({ issues: {} }),
}

export default networkConfig
