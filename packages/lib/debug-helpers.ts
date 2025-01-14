import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import sepoliaNetworkConfig from '@repo/lib/config/networks/sepolia'
import { Address } from 'viem'

/*
  Temporary shared helpers and constants used by debug pages until we finish the real implementations (depending on SDK and other blocking parts)
*/
export const balAddress = '0xba100000625a3754423978a60c9317c58a424e3d' as const
export const wETHAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' as const
export const wjAuraAddress = '0x198d7387Fa97A73F05b8578CdEFf8F2A1f34Cd1F' as const

export const usdcDaiUsdtBptAddress = '0x79c58f70905f734641735bc61e45c19dd9ad60bc' as const //USDC-DAI-USDT
export const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f' as const
export const waUsdcAddress = '0xd4fa2d31b7968e448877f69a96de69f5de8cd23e' as const // Wrapped Aave USDC
export const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' as const
export const waUsdtAddress = '0x7bc3485026ac48b6cf9baf0a377477fff5703af8' as const // Wrapped Aave USDT
export const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7' as const

export const osEth_WETH_BptAddress = '0xdacf5fa19b1f720111609043ac67a9818262850c' as const
export const osEthAddress = '0xf1c9acdc66974dfb6decb12aa385b9cd01190e38' as const

export const sdBalAddress = '0xf24d8651578a55b0c119b9910759a351a3458895' as const
export const auraBalAddress = '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d' as const
export const bal80Weth20Address = '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56' as const

export const ethAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as const
export const polAddress = '0x0000000000000000000000000000000000001010' as const

export const vEth = '0x4bc3263eb5bb2ef7ad9ab6fb68be80e43b43801f' as const

export const nested50WETH_50_3poolId =
  '0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0' as const //50WETH-50-3pool

export const threePoolId =
  '0x79c58f70905f734641735bc61e45c19dd9ad60bc0000000000000000000004e7' as const

export const gyro2CLP_USDC_DAI =
  '0xdac42eeb17758daa38caf9a3540c808247527ae3000200000000000000000a2b' as const

export const recoveryModePoolId =
  '0x4fd4687ec38220f805b6363c3c1e52d0df3b5023000200000000000000000473' as const // weighted pool in recovery mode (wstEth-euler)

export const vaultV2Address = mainnetNetworkConfig.contracts.balancer.vaultV2 as Address
export const vaultV3Address = sepoliaNetworkConfig.contracts.balancer.vaultV3 as Address

export const poolId = '0x68e3266c9c8bbd44ad9dca5afbfe629022aee9fe000200000000000000000512' as const // Balancer Weighted wjAura and WETH

export const sepoliaRouter = sepoliaNetworkConfig.contracts.balancer.router
export const sepoliaCompositeRouter =
  sepoliaNetworkConfig.contracts.balancer.compositeLiquidityRouter

/*
  Used to pretty print objects when debugging
*/
export function humanizeObject(input?: object | null) {
  return JSON.stringify(input, null, 4)
}

export function printJson(input: object) {
  return console.log(humanizeObject(input))
}
