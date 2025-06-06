import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { GqlChain, GqlToken } from '@repo/lib/shared/services/api/generated/graphql'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { Address } from 'viem'

export const fakeTokenSymbols = [
  'ETH',
  'WETH',
  'BAL',
  'RPL',
  'USDT',
  'DAI',
  'aUSDC',
  'USDC',
  'USDC-DAI-USDT',
  'B-80BAL-20WETH',
] as const
export type FakeTokenSymbol = (typeof fakeTokenSymbols)[number]

/* TBD:
 Maybe adding a command to reload this file (with 10 tokens for each chain) from a real request
 */
export const allFakeGqlTokens: GqlToken[] = [
  {
    __typename: 'GqlToken',
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
    chainId: 1,
    chain: GqlChain.Mainnet,
    logoURI:
      'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
    priority: 0,
    tradable: true,
    isErc4626: false,
    isBufferAllowed: true,
  },
  {
    __typename: 'GqlToken',
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    chainId: 1,
    chain: GqlChain.Mainnet,
    logoURI:
      'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
    priority: 0,
    tradable: true,
    isErc4626: false,
    isBufferAllowed: true,
  },
  {
    __typename: 'GqlToken',
    address: '0x7b79995e5f793a07bc00c21412e50ecae098e7f9',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    chainId: 1,
    chain: GqlChain.Sepolia,
    logoURI:
      'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
    priority: 0,
    tradable: true,
    isErc4626: false,
    isBufferAllowed: true,
  },
  {
    __typename: 'GqlToken',
    address: '0xba100000625a3754423978a60c9317c58a424e3d',
    name: 'Balancer',
    symbol: 'BAL',
    decimals: 18,
    chainId: 1,
    chain: GqlChain.Mainnet,
    logoURI:
      'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xba100000625a3754423978a60c9317c58a424e3d.png',
    priority: 0,
    tradable: true,
    isErc4626: false,
    isBufferAllowed: true,
  },
  {
    __typename: 'GqlToken',
    address: '0xb19382073c7a0addbb56ac6af1808fa49e377b75',
    name: 'Balancer',
    symbol: 'BAL',
    decimals: 18,
    chainId: 11155111,
    chain: GqlChain.Sepolia,
    logoURI:
      'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xba100000625a3754423978a60c9317c58a424e3d.png',
    priority: 0,
    tradable: true,
    isErc4626: false,
    isBufferAllowed: true,
  },
  {
    __typename: 'GqlToken',
    address: '0x8a88124522dbbf1e56352ba3de1d9f78c143751e',
    name: 'Static Aave Ethereum USDC',
    symbol: 'stataEthUSDC',
    decimals: 6,
    chain: GqlChain.Sepolia,
    chainId: 11155111,
    logoURI: null,
    priority: 0,
    tradable: true,
    isErc4626: true,
    isBufferAllowed: true,
    coingeckoId: null,
  },
  {
    __typename: 'GqlToken',
    address: '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8',
    name: 'USDC (AAVE Faucet)',
    symbol: 'usdc-aave',
    decimals: 6,
    chain: GqlChain.Sepolia,
    chainId: 11155111,
    logoURI: null,
    priority: 0,
    tradable: true,
    isErc4626: false,
    isBufferAllowed: true,
    coingeckoId: 'usd-coin',
  },
  {
    __typename: 'GqlToken',
    address: '0x978206fae13faf5a8d293fb614326b237684b750',
    name: 'Static Aave Ethereum USDT',
    symbol: 'stataEthUSDT',
    decimals: 6,
    chain: GqlChain.Sepolia,
    chainId: 11155111,
    logoURI: null,
    priority: 0,
    tradable: true,
    isErc4626: true,
    isBufferAllowed: true,
    coingeckoId: null,
  },
  {
    __typename: 'GqlToken',
    address: '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0',
    name: 'USDT (AAVE Faucet)',
    symbol: 'usdt-aave',
    decimals: 6,
    chain: GqlChain.Sepolia,
    chainId: 11155111,
    logoURI: null,
    priority: 0,
    tradable: true,
    isErc4626: false,
    isBufferAllowed: true,
    coingeckoId: 'tether',
  },
  {
    __typename: 'GqlToken',
    address: '0xff34b3d4aee8ddcd6f9afffb6fe49bd371b8a357',
    name: 'DAI (AAVE Faucet)',
    symbol: 'dai-aave',
    decimals: 18,
    chain: GqlChain.Sepolia,
    chainId: 11155111,
    logoURI: null,
    priority: 0,
    tradable: true,
    isErc4626: false,
    isBufferAllowed: true,
    coingeckoId: 'dai',
  },
  {
    __typename: 'GqlToken',
    address: '0xde46e43f46ff74a23a65ebb0580cbe3dfe684a17',
    name: 'Static Aave Ethereum DAI',
    symbol: 'stataEthDAI',
    decimals: 18,
    chain: GqlChain.Sepolia,
    chainId: 11155111,
    logoURI: null,
    priority: 0,
    tradable: true,
    isErc4626: true,
    isBufferAllowed: true,
    coingeckoId: null,
  },
  {
    __typename: 'GqlToken',
    address: '0xd33526068d116ce69f19a9ee46f0bd304f21a51f',
    name: 'Rocket Pool Protocol',
    symbol: 'RPL',
    decimals: 18,
    chainId: 1,
    chain: GqlChain.Mainnet,
    logoURI:
      'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xd33526068d116ce69f19a9ee46f0bd304f21a51f.png',
    priority: 0,
    tradable: true,
    isBufferAllowed: true,
    isErc4626: false,
  },
  {
    __typename: 'GqlToken',
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    chainId: 1,
    chain: GqlChain.Mainnet,
    logoURI:
      'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
    priority: 0,
    tradable: false,
    isBufferAllowed: true,
    isErc4626: false,
  },
  {
    __typename: 'GqlToken',
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    chainId: 1,
    chain: GqlChain.Mainnet,
    logoURI:
      'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
    priority: 0,
    tradable: false,
    isErc4626: false,
    isBufferAllowed: true,
  },
  {
    __typename: 'GqlToken',
    address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
    name: 'Dai Stablecoin',
    symbol: 'DAI Polygon',
    decimals: 18,
    chainId: 137,
    chain: GqlChain.Polygon,
    logoURI:
      'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
    priority: 0,
    tradable: false,
    isErc4626: false,
    isBufferAllowed: true,
  },
  {
    __typename: 'GqlToken',
    address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    name: 'WPOL',
    symbol: 'WPOL',
    decimals: 18,
    chainId: 137,
    chain: GqlChain.Polygon,
    logoURI: '',
    priority: 0,
    tradable: false,
    isErc4626: false,
    isBufferAllowed: true,
  },
  {
    __typename: 'GqlToken',
    address: '0x9ba00d6856a4edf4665bca2c2309936572473b7e',
    name: 'Aave Interest bearing USDC',
    symbol: 'aUSDC',
    decimals: 6,
    chainId: 1,
    chain: GqlChain.Mainnet,
    logoURI: 'https://assets.coingecko.com/coins/images/11674/large/aUSDC.png?1592546449',
    priority: 0,
    tradable: true,
    isErc4626: false,
    isBufferAllowed: true,
  },
  {
    __typename: 'GqlToken',
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    chainId: 1,
    chain: GqlChain.Mainnet,
    logoURI:
      'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    priority: 0,
    tradable: true,
    isErc4626: false,
    isBufferAllowed: true,
  },
  {
    // Used in 50WETH-50-3pool nested pool tests
    __typename: 'GqlToken',
    address: '0x79c58f70905f734641735bc61e45c19dd9ad60bc',
    name: 'USDC-DAI-USDT',
    symbol: 'USDC-DAI-USDT',
    decimals: 18,
    chainId: 1,
    chain: GqlChain.Mainnet,
    logoURI:
      'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    priority: 0,
    tradable: true,
    isErc4626: false,
    isBufferAllowed: true,
  },
  {
    // Used in VeBal voting related tests
    __typename: 'GqlToken',
    address: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
    name: 'B-80BAL-20WETH',
    symbol: 'B-80BAL-20WETH',
    decimals: 18,
    chainId: 1,
    chain: GqlChain.Mainnet,
    logoURI:
      'https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    priority: 0,
    tradable: true,
    isErc4626: false,
    isBufferAllowed: true,
  },
]

export function fakeTokenBySymbol(symbol: FakeTokenSymbol) {
  const token = allFakeGqlTokens.find(token => token.symbol === symbol)
  if (!token) {
    console.log(
      'Available fake tokens: ',
      allFakeGqlTokens.map(token => token.symbol)
    )
    throw new Error(`Invalid symbol for fake token: ${symbol}`)
  }
  return token
}

export function fakeTokenByAddress(address: Address) {
  const token = allFakeGqlTokens.find(token => isSameAddress(token.address, address))
  if (!token) {
    console.log(
      'Available fake tokens: ',
      allFakeGqlTokens.map(token => token.symbol)
    )
    throw new Error(`Invalid address for fake token: ${address}`)
  }
  return token
}

export function fakeTokenByAddressAndChain(address: Address, chain: GqlChain) {
  const token = allFakeGqlTokens.find(
    token => isSameAddress(token.address, address) && token.chain === chain
  )
  if (!token) {
    console.log(
      'Available fake tokens: ',
      allFakeGqlTokens.map(token => token.symbol)
    )
    throw new Error(`Invalid address for fake token: ${address}, chain: ${chain}`)
  }
  return token
}

export function fakeGetToken(address: string, chain: GqlChain): ApiToken | undefined {
  return fakeTokenByAddressAndChain(address as Address, chain as GqlChain)
}

// console.log(
//   JSON.stringify(
//     allFakeGqlTokens.map(t => t.symbol),
//     null,
//     2
//   )
// )
