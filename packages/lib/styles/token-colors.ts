import { Address } from 'viem'
import { GqlChain } from '../shared/services/api/generated/graphql'
import { getGqlChain } from '../config/app.config'
import { getRandomInt } from '../shared/utils/numbers'

export type TokenColorDef = {
  from: string
  to: string
}

const tokenColors: Partial<Record<GqlChain, Record<Address, TokenColorDef>>> = {
  [GqlChain.Mainnet]: {
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': { from: '#627EEA', to: '#627EEA' }, // 'ETH'
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { from: '#627EEA', to: '#627EEA' }, // 'WETH' // FIXME!
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { from: '#2775CA', to: '#2775CA' }, // 'USDC'
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#F5AC37', to: '#F5AC37' }, // 'DAI'
    '0xdac17f958d2ee523a2206206994597c13d831ec7': { from: '#50AF95', to: '#50AF95' }, // 'USDT'
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': { from: '#F09242', to: '#F09242' }, // 'WBTC'
    '0xba100000625a3754423978a60c9317c58a424e3d': { from: '#E7DEBD', to: '#E7DEBD' }, // 'BAL'
    '0xc0c293ce456ff0ed870add98a0828dd4d2903dbf': { from: '#8C43D2', to: '#8C43D2' }, // 'AURA'
    '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d': { from: '#AB60F3', to: '#AB60F3' }, // 'auraBAL'
    '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56': { from: '#D7B554', to: '#D7B554' }, // 'B-80BAL-20WETH'
    '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': { from: '#00A3FF', to: '#00A3FF' }, // 'wstETH'
    '0xae78736cd615f374d3085123a210448e74fc6393': { from: '#FF6E2F', to: '#FF6E2F' }, // 'rETH'
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': { from: '#9996FD', to: '#9996FD' }, // 'AAVE'
    '0xbf5495efe5db9ce00f80364c8b423567e58d2110': { from: '#ACE731', to: '#ACE731' }, // 'ezETH'
    '0xe07f9d810a48ab5c3c914ba3ca53af14e4491e8a': { from: '#F0FF9B', to: '#F0FF9B' }, // 'GYD'
    '0x6810e776880c02933d47db1b9fc05908e5386b96': { from: '#3E6957', to: '#3E6957' }, // 'GNO'
    '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f': { from: '#C8B5F2', to: '#C8B5F2' }, // 'GHO'
  },
  [GqlChain.Arbitrum]: {
    '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8': { from: '#FF5733', to: '#FF5733' }, // USDC
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1': { from: '#33FF57', to: '#33FF57' }, // WETH
    '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f': { from: '#3357FF', to: '#3357FF' }, // WBTC
    '0x912ce59144191c1204e64559fe8253a0e49e6548': { from: '#FF33A1', to: '#FF33A1' }, // ARB
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#A133FF', to: '#A133FF' }, // DAI
  },
  [GqlChain.Base]: {
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { from: '#FF5733', to: '#FF5733' }, // USDC
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#33FF57', to: '#33FF57' }, // DAI
    '0x853d955acef822db058eb8505911ed77f175b99e': { from: '#3357FF', to: '#3357FF' }, // FRAX
    '0x5a98fcbea516cf06857215779fd812ca3bef1b32': { from: '#FF33A1', to: '#FF33A1' }, // LDO
  },
  [GqlChain.Avalanche]: {
    '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7': { from: '#FF5733', to: '#FF5733' }, // WAVAX
    '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664': { from: '#33FF57', to: '#33FF57' }, // USDC.e
    '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e': { from: '#3357FF', to: '#3357FF' }, // USDC
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#FF33A1', to: '#FF33A1' }, // DAI
  },
  [GqlChain.Fantom]: {
    '0x04068da6c83afcfa0e13ba15a6696662335d5b75': { from: '#FF5733', to: '#FF5733' }, // USDC
    '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e': { from: '#33FF57', to: '#33FF57' }, // DAI
    '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83': { from: '#3357FF', to: '#3357FF' }, // WFTM
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#FF33A1', to: '#FF33A1' }, // DAI
  },
  [GqlChain.Gnosis]: {
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#FF5733', to: '#FF5733' }, // DAI
    '0x4e15361fd6b4bb609fa63c81a2be19d873717870': { from: '#33FF57', to: '#33FF57' }, // FTM
  },
  [GqlChain.Optimism]: {
    '0x4200000000000000000000000000000000000042': { from: '#FF5733', to: '#FF5733' }, // OP
    '0x7f5c764cbc14f9669b88837ca1490cca17c31607': { from: '#33FF57', to: '#33FF57' }, // USDC
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#3357FF', to: '#3357FF' }, // DAI
  },
  [GqlChain.Polygon]: {
    '0x0000000000000000000000000000000000001010': { from: '#FF5733', to: '#FF5733' }, // MATIC
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': { from: '#33FF57', to: '#33FF57' }, // USDC
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#3357FF', to: '#3357FF' }, // DAI
  },
  [GqlChain.Zkevm]: {
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#FF5733', to: '#FF5733' }, // DAI
  },
  [GqlChain.Sepolia]: {
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#FF5733', to: '#FF5733' }, // DAI
  },
  [GqlChain.Mode]: {
    '0x6b175474e89094c44da98b954eedeac495271d0f': { from: '#FF5733', to: '#FF5733' }, // DAI
  },
  [GqlChain.Fraxtal]: {
    '0x853d955acef822db058eb8505911ed77f175b99e': { from: '#FF5733', to: '#FF5733' }, // FRAX
  },
  [GqlChain.Hyperevm]: {},
  [GqlChain.Sonic]: {},
  [GqlChain.Plasma]: {},
}

const DEFAULT_TOKEN_COLORS: TokenColorDef[] = [
  { from: '#1E4CF1', to: '#00FFAA' },
  { from: '#B2C4DB', to: '#FDFDFD' },
  { from: '#EF4A2B', to: '#F48975' },
  { from: '#FFD600', to: '#F48975' },
  { from: '#9C68AA', to: '#C03BE4' },
  { from: '#FFBD91', to: '#FF957B' },
  { from: '#30CEF0', to: '#02A2FE' },
  { from: '#FFDD00', to: '#FFF5B2' },
  { from: '#FF07A4', to: '#FF9EDB' },
  { from: '#039241', to: '#96FDC3' },
  { from: '#001B7D', to: '#1448FF' },
  { from: '#871500', to: '#F02600' },
  { from: '#EA6200', to: '#FFB885' },
  { from: '#AAAAAA', to: '#666666' },
  { from: '#D4FF00', to: '#EEFF99' },
  { from: '#510A94', to: '#8614F0' },
]

const defaultColor: TokenColorDef = { from: '#30CEF0', to: '#02A2FE' }

export function getTokenColor(
  chain: GqlChain | number,
  address: Address,
  i?: number
): TokenColorDef {
  const normalizedAddress = address.toLowerCase() as Address
  const normalizedChain = typeof chain === 'number' ? getGqlChain(chain) : chain
  const defaultColorIndex = i === undefined ? getRandomInt(0, 15) : i

  return (
    (tokenColors[normalizedChain] && tokenColors[normalizedChain][normalizedAddress]) ||
    DEFAULT_TOKEN_COLORS[defaultColorIndex] ||
    defaultColor
  )
}

export function getCssTokenColor(chain: GqlChain | number, address: Address, i: number) {
  const color = getTokenColor(chain, address, i)
  return `linear-gradient(180deg, ${color.from} 0%, ${color.to} 100%)`
}
