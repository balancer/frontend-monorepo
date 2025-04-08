import { TokenBalance } from './fork-options'

/*
  Edit the following defaults to setup scenarios for manual tests
  (E2E dev tests have their own fork option defaults)
 */
export const mainnetTokenBalances: TokenBalance[] = [
  {
    tokenAddress: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56', // B-80BAL-20WETH
    value: '6000',
  },
  {
    tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    value: '5000',
  },
  {
    tokenAddress: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0', // wstETH
    value: '6000',
  },
  {
    tokenAddress: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', // AAVE
    value: '7000',
  },
  {
    tokenAddress: '0x91c65c2a9a3adfe2424ecc4a4890b8334c3a8212', // ONE
    value: '8000',
  },
  {
    tokenAddress: '0x98fae31948b16b90a2c72cccc10cb61654850b28', // NIN
    value: '9000',
  },
  {
    tokenAddress: '0xf1c9acdc66974dfb6decb12aa385b9cd01190e38', // osETH
    value: '9000',
  },
  {
    tokenAddress: '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f', // GHO
    value: '6000',
  },
]

export const baseTokenBalances: TokenBalance[] = [
  {
    tokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
    value: '5000',
    decimals: 6,
  },
  {
    tokenAddress: '0x6bb7a212910682dcfdbd5bcbb3e28fb4e8da10ee', // GHO
    value: '3000',
  },
  {
    tokenAddress: '0x4200000000000000000000000000000000000006', // WETH
    value: '4000',
  },
  {
    tokenAddress: '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2', // USDT
    value: '3000',
    decimals: 6,
  },
]

export const gnosisTokenBalances: TokenBalance[] = [
  {
    tokenAddress: '0x9c58bacc331c9aa871afd802db6379a98e80cedb', // GNO
    value: '2000',
  },
  {
    tokenAddress: '0x177127622c4a00f3d409b75571e12cb3c8973d3c', // COW
    value: '5000',
  },
  {
    tokenAddress: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d', // WXDAI
    value: '3000',
  },
  {
    tokenAddress: '0x2a22f9c3b484c3629090feed35f17ff8f88f76f0', // USDC.e
    value: '300',
    decimals: 6,
  },
]

export const sonicTokenBalances: TokenBalance[] = [
  {
    tokenAddress: '0xe6cc4d855b4fd4a9d02f46b9adae4c5efb1764b5', // LUDWING
    value: '20000',
  },
  {
    tokenAddress: '0x3bce5cb273f0f148010bbea2470e7b5df84c7812', // scETH
    value: '0.01',
  },
  {
    tokenAddress: '0xbb30e76d9bb2cc9631f7fc5eb8e87b5aff32bfbd', // scBTC
    value: '0.01',
  },
  {
    tokenAddress: '0x29219dd400f2bf60e5a23d13be72b486d4038894', // USDC.e
    value: '50',
    decimals: 6,
  },
]

export const polygonTokenBalances: TokenBalance[] = [
  {
    tokenAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // wPOL
    value: '20000',
  },
  {
    tokenAddress: '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6', // maticX
    value: '30000',
  },
]
