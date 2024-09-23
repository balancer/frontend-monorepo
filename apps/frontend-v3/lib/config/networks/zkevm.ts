import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import { convertHexToLowerCase } from '@/lib/shared/utils/objects'
import { PoolIssue } from '@/lib/modules/pool/alerts/pool-issues/PoolIssue.type'
import { CSP_ISSUE_POOL_IDS } from '@/lib/shared/data/csp-issue'

const networkConfig: NetworkConfig = {
  chainId: 1101,
  name: 'Polygon zkEVM Mainnet',
  shortName: 'Polygon zkEVM',
  chain: GqlChain.Zkevm,
  iconPath: '/images/chains/ZKEVM.svg',
  blockExplorer: {
    baseUrl: 'https://zkevm.polygonscan.com',
    name: 'Polygonscan',
  },
  tokens: {
    addresses: {
      bal: '0x120ef59b80774f02211563834d8e3b72cb1649d6',
      wNativeAsset: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
    },
    nativeAsset: {
      name: 'Ether',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      symbol: 'ETH',
      decimals: 18,
    },
    defaultSwapTokens: {
      tokenIn: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    popularTokens: {
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': 'ETH',
      '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9': 'WETH',
      '0xb23c20efce6e24acca0cef9b7b7aa196b84ec942': 'rETH',
      '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035': 'USDC',
      '0x5d8cff95d7a57c0bf50b30b43c7cc0d52825d4a9': 'wstETH',
      '0x8c7d118b5c47a5bcbd47cc51789558b98dad17c5': 'rsETH',
      '0x120ef59b80774f02211563834d8e3b72cb1649d6': 'BAL',
      '0x1509706a6c66ca549ff0cb464de88231ddbe213b': 'AURA',
      '0xa2036f0538221a77a3937f1379699f44945018d0': 'MATIC',
      '0x1e4a5963abfd975d8c9021ce480b42188849d41d': 'USDT',
      '0xc5015b9d9161dca7e18e32f6f25c4ad850731fd4': 'DAI',
    },
  },
  contracts: {
    multicall2: '0xca11bde05977b3631167028862be2a173976ca11',
    balancer: {
      vaultV2: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      relayerV6: '0x8e620FfCa2580ed87241D7e10F85EE75d0a906F5',
      minter: '0x475D18169BE8a89357A9ee3Ab00ca386d20fA229',
    },
    veDelegationProxy: '0xc7E5ED1054A24Ef31D827E6F86caA58B3Bc168d7',
  },
  pools: convertHexToLowerCase({
    issues: { [PoolIssue.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[GqlChain.Zkevm] },
  }),
}

export default networkConfig
