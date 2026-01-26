import { TokenBalance } from './fork-options'

/*
  Edit the following defaults to setup scenarios for manual tests
  (E2E dev tests have their own fork option defaults)

  Some slots cannot be easily guessed so we hardcode them from here:
  https://github.com/balancer/b-sdk/blob/2f8df4f20c9c9e478c58c5169c30055488d227c5/test/lib/utils/addresses.ts#L208

  If not found on that list alternative tools can be used:
  - https://hackmd.io/@oS7_rZFHQnCFw_lsRei3nw/HJN1rQWmA
    `curl http://token-bss.xyz/eth/<token-address> | jq`
  - https://github.com/kendricktan/slot20
 */

export const mainnetTokenBalances: TokenBalance[] = [
  {
    tokenAddress: '0xba100000625a3754423978a60c9317c58a424e3d', // BAL
    value: '10000',
  },
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
  {
    tokenAddress: '0xc3d21f79c3120a4ffda7a535f8005a7c297799bf', // TERM
    value: '10000',
    slot: BigInt('0x52c63247e1f47db19d5ce0460030c497f067ca4cebf71ba98eeadabe20bace00'),
  },
  {
    tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    value: '2000',
    decimals: 6,
  },
  {
    tokenAddress: '0x1D13531bf6344c102280CE4c458781FBF14Dad14',
    value: '1',
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
    value: '100000',
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

export const avalancheTokenBalances: TokenBalance[] = [
  // tokens for v3 pool: pools/avalanche/v3/0x99a9a471dbe0dcc6855b4cd4bbabeccb1280f5e8
  {
    tokenAddress: '0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be', // sAVAX
    value: '20000',
    slot: 203n,
  },
  {
    tokenAddress: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', // WAVAX
    value: '30000',
  },
  {
    tokenAddress: '0xa25eaf2906fa1a3a13edac9b9657108af7b703e3', // ggAVAX
    value: '40000',
  },
  // tokens for v3 pool: pools/avalanche/v3/0x31ae873544658654ce767bde179fd1bbcb84850b/add-liquidity
  {
    tokenAddress: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7', // USDT
    value: '50000',
    decimals: 6,
    slot: 51n,
  },
  {
    tokenAddress: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', // USDC
    value: '50000',
    decimals: 6,
  },
  /*
    AUSD uses packed slots which is not supported by the current useSetErc20Balance implementation
    Context: https://book.getfoundry.sh/reference/forge-std/enable_packed_slots
    */
  {
    tokenAddress: '0x00000000efe302beaa2b3e6e1b18d08d69a9012a', // AUSD
    value: '50000',
    decimals: 6,
  },
]

export const hyperEVMTokenBalances: TokenBalance[] = [
  //pools/hyperevm/v3/0xb2ba1dc0af7ebc7eb9b398d1cf43bc360afedf6f
  {
    tokenAddress: '0x1ecd15865d7f8019d546f76d095d9c93cc34edfa', // LIQD
    value: '100',
  },
  {
    tokenAddress: '0x5555555555555555555555555555555555555555', // WHYPE
    value: '100',
  },
]

export const plasmaTokenBalances: TokenBalance[] = [
  {
    tokenAddress: '0x9895D81bB462A195b4922ED7De0e3ACD007c32CB', // WETH
    value: '10000',
  },
  {
    tokenAddress: '0x6eaf19b2fc24552925db245f9ff613157a7dbb4c', // xUSD
    value: '1000',
    decimals: 6,
  },
  {
    tokenAddress: '0xa9c251f8304b1b3fc2b9e8fcae78d94eff82ac66', // tcUSDT0
    value: '1000',
    decimals: 6,
  },
  {
    tokenAddress: '0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb', // USDT0
    value: '1000',
    decimals: 6,
  },
]
