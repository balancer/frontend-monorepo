import {
  arbitrum,
  avalanche,
  base,
  fantom,
  fraxtal,
  gnosis,
  mainnet,
  mode,
  optimism,
  polygon,
  polygonZkEvm,
  sepolia,
  sonic,
} from 'viem/chains'
import { Address, Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
// import { drpcUrlByChainId } from '@repo/lib/shared/utils/rpc'

// FIXME: [JUANJO] This is duplicated on rpc.ts
const chainIdToDrpcName: Record<number, string | undefined> = {
  [mainnet.id]: 'ethereum',
  [arbitrum.id]: 'arbitrum',
  [optimism.id]: 'optimism',
  [base.id]: 'base',
  [polygon.id]: 'polygon',
  [avalanche.id]: 'avalanche',
  [fantom.id]: 'fantom',
  [sepolia.id]: 'sepolia',
  [fraxtal.id]: 'fraxtal',
  [gnosis.id]: 'gnosis',
  [mode.id]: 'mode',
  [polygonZkEvm.id]: 'polygon-zkevm',
  [sonic.id]: 'sonic',
}

export function drpcUrlByChainId(chainId: number, privateKey: string) {
  const chainSlug = chainIdToDrpcName[chainId]
  if (!chainSlug) throw new Error(`Invalid chain id: ${chainId}`)
  return `https://lb.drpc.org/ogrpc?network=${chainSlug}&dkey=${privateKey}`
}

const networksWithFork = [mainnet, polygon, sepolia, gnosis, fantom, sonic] as const
export type ChainIdWithFork = (typeof networksWithFork)[number]['id']

export type NetworkSetup = {
  chainId: ChainIdWithFork
  fallBackRpc: string | undefined
  port: number
  forkBlockNumber?: bigint
}

export const defaultAnvilTestPrivateKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

// anvil account address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
export const defaultTestUserAccount = privateKeyToAccount(defaultAnvilTestPrivateKey as Hex).address
export const alternativeTestUserAccount = '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720'
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
  [fantom.id]: 8945,
  [gnosis.id]: 9045,
  [sonic.id]: 9145,
}

export const ANVIL_NETWORKS: Record<ChainIdWithFork, NetworkSetup> = {
  [mainnet.id]: {
    chainId: mainnet.id,
    fallBackRpc: 'https://cloudflare-eth.com',
    port: ANVIL_PORTS[mainnet.id],
    // From time to time this block gets outdated having this kind of error in integration tests:
    // ContractFunctionExecutionError: The contract function "queryJoin" returned no data ("0x").
    // forkBlockNumber: 21831471n,
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
    // For now we will use the last block until v3 deployments are final
    // forkBlockNumber: 6679621n,
  },
  [fantom.id]: {
    chainId: fantom.id,
    fallBackRpc: 'https://gateway.tenderly.co/public/fantom',
    port: ANVIL_PORTS[fantom.id],
    forkBlockNumber: 99471829n,
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
