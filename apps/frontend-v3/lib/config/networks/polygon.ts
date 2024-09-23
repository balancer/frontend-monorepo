import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import { convertHexToLowerCase } from '@/lib/shared/utils/objects'
import { PoolIssue } from '@/lib/modules/pool/alerts/pool-issues/PoolIssue.type'
import { CSP_ISSUE_POOL_IDS } from '@/lib/shared/data/csp-issue'

const networkConfig: NetworkConfig = {
  chainId: 137,
  name: 'Polygon Mainnet',
  shortName: 'Polygon',
  chain: GqlChain.Polygon,
  iconPath: '/images/chains/POLYGON.svg',
  minConfirmations: 13,
  blockExplorer: {
    baseUrl: 'https://polygonscan.com',
    name: 'Polygonscan',
  },
  tokens: {
    addresses: {
      bal: '0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3',
      wNativeAsset: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    },
    nativeAsset: {
      name: 'Matic',
      address: '0x0000000000000000000000000000000000001010',
      symbol: 'MATIC',
      decimals: 18,
    },
    defaultSwapTokens: {
      tokenIn: '0x0000000000000000000000000000000000001010',
    },
    popularTokens: {
      '0x0000000000000000000000000000000000001010': 'MATIC',
      '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270': 'WMATIC',
      '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6': 'MaticX',
      '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': 'WETH',
      '0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3': 'BAL',
      '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4': 'stMATIC',
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174': 'USDC',
      '0xc2132D05D31c914a87C6611C10748AEb04B58e8F': 'USDT',
      '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063': 'DAI',
      '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6': 'WBTC',
      '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39': 'LINK',
      '0x1509706a6c66ca549ff0cb464de88231ddbe213b': 'AURA',
    },
  },
  contracts: {
    multicall2: '0x275617327c958bD06b5D6b871E7f491D76113dd8',
    balancer: {
      vaultV2: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      relayerV6: '0xB1ED8d3b5059b3281D43306cC9D043cE8B22599b',
      minter: '0x47B489bf5836f83ABD928C316F8e39bC0587B020',
    },
    veDelegationProxy: '0x0f08eEf2C785AA5e7539684aF04755dEC1347b7c',
  },
  pools: convertHexToLowerCase({
    issues: {
      [PoolIssue.PoolProtocolFeeVulnWarning]: [
        '0xb54b2125b711cd183edd3dd09433439d5396165200000000000000000000075e',
      ],
      [PoolIssue.RenBTCWarning]: [
        '0xfeadd389a5c427952d8fdb8057d6c8ba1156cc5600020000000000000000001e',
      ],
      [PoolIssue.PoolOwnerVulnWarningGovernanceMigrate]: [
        '0x06df3b2bbb68adc8b0e302443692037ed9f91b42000000000000000000000012',
        '0xc17636e36398602dd37bb5d1b3a9008c7629005f0002000000000000000004c4',
      ],
      [PoolIssue.PoolOwnerVulnWarningGovernance]: [
        '0xf38cf113d2d4f60c36cbd95af2f48a9a0167045a00000000000000000000005b',
        '0x0d34e5dd4d8f043557145598e4e2dc286b35fd4f000000000000000000000068',
        '0x5028497af0c9a54ea8c6d42a054c0341b9fc616800020000000000000000007b',
        '0xc31a37105b94ab4efca1954a14f059af11fcd9bb000000000000000000000455',
      ],
      [PoolIssue.PoolOwnerVulnWarningEcosystemMigrate]: [
        '0xaf5e0b5425de1f5a630a8cb5aa9d97b8141c908d000200000000000000000366',
      ],
      [PoolIssue.PoolOwnerVulnWarningEcosystem]: [
        '0xb4670d1389c758e4380c4211bcbc85342688b9c50002000000000000000003d8',
      ],
      [PoolIssue.CspPoolVulnWarning]: CSP_ISSUE_POOL_IDS[GqlChain.Polygon],
      [PoolIssue.FxPoolVulnWarning]: [
        '0x216b176513c500dbe1d677939103e350a9373a390002000000000000000008da',
        '0x726e324c29a1e49309672b244bdc4ff62a270407000200000000000000000702',
        '0x7e8c6d9db2d1b522f32d050257df0dc524593a07000200000000000000000c4e',
        '0x835ec7212c6075b85730d504c8a19a7116db81b3000200000000000000000703',
        '0x8630bd161689403aea635f830e9ef5496e7e0bc1000200000000000000000c35',
        '0x882c7a84231484b3e9f3fd45ac04b1eb5d35b076000200000000000000000a91',
        '0x8a8275eda88a6f4cc2fa6a41837c1b5dc7a3b095000200000000000000000c36',
        '0xe5093fa1f24619eb16c704a808fad66fb65a1305000200000000000000000c50',
        '0xe93f9dd10b0ba38831cba4d5a9d092e22db130ec000200000000000000000c44',
        '0xfd24afa5416c8de94fdbaf344840f524155a4dd00002000000000000000008db',
      ],
    },
  }),
}

export default networkConfig
