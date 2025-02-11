import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import { zeroAddress } from 'viem'
import { convertHexToLowerCase } from '@repo/lib/shared/utils/objects'
import { emptyAddress } from '@repo/lib/modules/web3/contracts/wagmi-helpers'
import { BALANCER_COMPOSITE_LIQUIDITY_ROUTER, BALANCER_ROUTER } from '@balancer/sdk'
import { fantom } from 'viem/chains'

const networkConfig: NetworkConfig = {
  chainId: 250,
  name: 'Fantom Opera',
  shortName: 'Fantom',
  chain: GqlChain.Fantom,
  iconPath: '/images/chains/FANTOM.svg',
  blockExplorer: {
    baseUrl: 'https://ftmscan.com',
    name: 'FTMScan',
  },
  tokens: {
    addresses: {
      bal: emptyAddress,
      wNativeAsset: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    },
    nativeAsset: {
      name: 'Fantom',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      symbol: 'FTM',
      decimals: 18,
    },
    stakedAsset: {
      name: 'sFTMx',
      address: '0xd7028092c830b5c8fce061af2e593413ebbc1fc1',
      symbol: 'sFTMx',
      decimals: 18,
    },
    defaultSwapTokens: {
      tokenIn: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
  },
  contracts: {
    multicall2: '0x66335d7ad8011f6aa3f48aadcb523b62b38ed961',
    balancer: {
      vaultV2: '0x20dd72Ed959b6147912C2e529F0a0C651c33c9ce',
      relayerV6: '0x0faa25293a36241c214f3760c6ff443e1b731981',
      minter: zeroAddress,
      router: BALANCER_ROUTER[fantom.id],
      compositeLiquidityRouter: BALANCER_COMPOSITE_LIQUIDITY_ROUTER[fantom.id],
    },
    beets: {
      lstStaking: '0x310A1f7bd9dDE18CCFD701A796Ecb83CcbedE21A',
      lstStakingProxy: '0xB458BfC855ab504a8a327720FcEF98886065529b',
      sfc: '0xFC00FACE00000000000000000000000000000000',
    },
  },
  pools: convertHexToLowerCase({ issues: {} }),
}

export default networkConfig
