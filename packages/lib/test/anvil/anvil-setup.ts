import { Address, Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet, polygon, sepolia } from 'viem/chains'

const networksWithFork = [mainnet, polygon, sepolia]
export type NetworksWithFork = (typeof networksWithFork)[number]['name']

export type NetworkSetup = {
  networkName: NetworksWithFork
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
  if (!index) {
    throw Error(`Account ${account} not found in test accounts.`)
  }
  return index
}

const ANVIL_PORTS: Record<NetworksWithFork, number> = {
  //Ports separated by 100 to avoid port collision when running tests in parallel
  Ethereum: 8645,
  Polygon: 8745,
  Sepolia: 8845,
}

export const ANVIL_NETWORKS: Record<NetworksWithFork, NetworkSetup> = {
  Ethereum: {
    networkName: 'Ethereum',
    fallBackRpc: 'https://cloudflare-eth.com',
    port: ANVIL_PORTS.Ethereum,
    // From time to time this block gets outdated having this kind of error in integration tests:
    // ContractFunctionExecutionError: The contract function "queryJoin" returned no data ("0x").
    // forkBlockNumber: 20474895n,
    forkBlockNumber: 20777062n,
  },
  Polygon: {
    networkName: 'Polygon',
    fallBackRpc: 'https://polygon-rpc.com',
    port: ANVIL_PORTS.Polygon,
    // Note - this has to be >= highest blockNo used in tests
    forkBlockNumber: 60496806n,
  },
  Sepolia: {
    networkName: 'Sepolia',
    fallBackRpc: 'https://gateway.tenderly.co/public/sepolia',
    port: ANVIL_PORTS.Sepolia,
    // For now we will use the last block until v3 deployments are final
    // forkBlockNumber: 6679621n,
  },
}

/*
    In vitest, each thread is assigned a unique numerical id (`process.env.VITEST_POOL_ID`).
    When jobId is provided, the fork proxy uses this id to create a different local rpc url (e.g. `http://127.0.0.1:/port/jobId>/`
    so that tests can be run in parallel (depending on the number of threads of the host machine)
*/
export const pool = Number(process.env.VITEST_POOL_ID ?? 1)

export function getTestRpcSetup(networkName: NetworksWithFork) {
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
export function getForkUrl(networkName: NetworksWithFork, verbose = false): string {
  const network = ANVIL_NETWORKS[networkName]
  const privateKey = process.env['NEXT_PRIVATE_DRPC_KEY']
  const dRpcUrl = (chainName: string) =>
    `https://lb.drpc.org/ogrpc?network=${chainName}&dkey=${privateKey}`

  if (privateKey) {
    if (network.networkName === 'Ethereum') {
      return dRpcUrl('ethereum')
    }
    if (network.networkName === 'Polygon') {
      return dRpcUrl('polygon')
    }
    if (network.networkName === 'Sepolia') {
      return dRpcUrl('sepolia')
    }
  }

  if (!network.fallBackRpc) {
    throw Error(`Please add a fallback RPC for ${network.networkName} network.`)
  }

  if (verbose) {
    console.warn(`Falling back to \`${network.fallBackRpc}\`.`)
  }
  return network.fallBackRpc
}
