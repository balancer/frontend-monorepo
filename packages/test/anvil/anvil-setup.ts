import { base, gnosis, mainnet, polygon, sepolia, sonic } from 'viem/chains'
import { Address, Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { drpcUrlByChainId } from '@repo/lib/shared/utils/rpc'

type NetworksWithFork = readonly [
  typeof mainnet,
  typeof polygon,
  typeof sepolia,
  typeof gnosis,
  typeof base,
  typeof sonic,
]
export type ChainIdWithFork = NetworksWithFork[number]['id']

export type NetworkSetup = {
  chainId: ChainIdWithFork
  fallBackRpc: string | undefined
  port: number
  forkBlockNumber?: bigint
}

export const defaultAnvilTestPrivateKey =
  '0x7dab599bf65d431bbe35d626d2c479f90b024c4981ec034c8b229468a05ea3d3'

export const defaultTestUserAccount = privateKeyToAccount(defaultAnvilTestPrivateKey as Hex).address
export const alternativeTestUserAccount = '0x625Ac6ECB5FE349398368e468cA037E3cC19592A'
export const userStakedInNonPreferentialGauge = '0x8163A459AC37f79D7E6845D4A3839AAa7F7f1bAd'

export const testAccounts: Address[] = [
  // Wagmi accounts
  defaultTestUserAccount,
  alternativeTestUserAccount,
  // Real accounts
  userStakedInNonPreferentialGauge,
]

export function testAccountIndex(account: Address) {
  const index = testAccounts.indexOf(account)
  if (index < 0) {
    throw Error(`Account ${account} not found in test accounts.`)
  }
  return index
}

const ANVIL_PORTS: Record<ChainIdWithFork, number> = {
  //Ports separated by 100 to avoid port collision when running tests in parallel
  [mainnet.id]: 8645,
  [polygon.id]: 8745,
  [sepolia.id]: 8845,
  [base.id]: 8945,
  [gnosis.id]: 9045,
  [sonic.id]: 9145,
}

export const ANVIL_NETWORKS: Record<ChainIdWithFork, NetworkSetup> = {
  [mainnet.id]: {
    chainId: mainnet.id,
    fallBackRpc: 'https://cloudflare-eth.com',
    port: ANVIL_PORTS[mainnet.id],
    /* From time to time this block gets outdated having this kind of error in integration tests:
     ContractFunctionExecutionError: The contract function "queryJoin" returned no data ("0x").
     forkBlockNumber: 22426500n, // block number from 6 May 2025 (1 day before pectra launch)
    */
  },
  [polygon.id]: {
    chainId: polygon.id,
    fallBackRpc: 'https://polygon-rpc.com',
    port: ANVIL_PORTS[polygon.id],
    // Note - this has to be >= highest blockNo used in tests
    // forkBlockNumber: 64747630n,
    forkBlockNumber: 67867894n,
  },
  [sepolia.id]: {
    chainId: sepolia.id,
    fallBackRpc: 'https://gateway.tenderly.co/public/sepolia',
    port: ANVIL_PORTS[sepolia.id],
    forkBlockNumber: 10280000n,
  },
  [base.id]: {
    chainId: base.id,
    fallBackRpc: 'https://gateway.tenderly.co/public/base',
    port: ANVIL_PORTS[base.id],
    forkBlockNumber: 42375000n,
  },
  [sonic.id]: {
    chainId: sonic.id,
    fallBackRpc: 'https://gateway.tenderly.co/public/sonic',
    port: ANVIL_PORTS[sonic.id],
    forkBlockNumber: 2687659n,
  },
  [gnosis.id]: {
    chainId: gnosis.id,
    fallBackRpc: 'https://gnosis.drpc.org',
    port: ANVIL_PORTS[gnosis.id],
    forkBlockNumber: 37902207n,
  },
}

/*
    In vitest, each thread is assigned a unique numerical id (`process.env.VITEST_POOL_ID`).
    When jobId is provided, the fork proxy uses this id to create a different local rpc url (e.g. `http://127.0.0.1:/port/jobId>/`
    so that tests can be run in parallel (depending on the number of threads of the host machine)
*/
export const pool = Number(process.env.VITEST_POOL_ID ?? 1)

export function getTestRpcSetup(networkName: ChainIdWithFork) {
  const network = ANVIL_NETWORKS[networkName]
  const port = network.port
  const rpcUrl = `http://127.0.0.1:${port}/${pool}`
  return { port, rpcUrl }
}

/*
 *  We currently use Drpc for all integration tests (Ethereum, Polygon and Sepolia networks)
 *  In case you want to use a different RPC, you can set something like this (i.e. ALCHEMY)
 *     const privateAlchemyKey = process.env['NEXT_PRIVATE_ALCHEMY_KEY']
 *     return `https://polygon-mainnet.g.alchemy.com/v2/${privateAlchemyKey}`
 */
export function getForkUrl(chainId: ChainIdWithFork, verbose = false): string {
  const network = ANVIL_NETWORKS[chainId]
  const privateKey = process.env['NEXT_PRIVATE_DRPC_KEY']

  if (!privateKey) {
    throw Error(`Please set the NEXT_PRIVATE_DRPC_KEY environment variable.`)
  }

  if (privateKey) {
    return drpcUrlByChainId(chainId, privateKey)
  }

  if (!network.fallBackRpc) {
    throw Error(`Please add a fallback RPC for ${network.chainId} network.`)
  }

  if (verbose) {
    console.warn(`Falling back to \`${network.fallBackRpc}\`.`)
  }
  return network.fallBackRpc
}
