'use client'

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { safe } from 'wagmi/connectors'

import {
  defaultAnvilAccount,
  defaultAnvilForkRpcUrl,
} from '@repo/lib/test/utils/wagmi/fork.helpers'
import { Address, Chain, http } from 'viem'
import { CreateConnectorFn, injected } from 'wagmi'
import { chains } from './ChainConfig'
import { customMock } from './impersonation/customMock'
import { transports } from './transports'
import { shouldUseAnvilFork } from '@repo/lib/config/app.config'

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID
if (!walletConnectProjectId) throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_ID env')

/*
  https://docs.reown.com/appkit/react/core/custom-connectors
*/
const connectors: CreateConnectorFn[] = [
  safe({ shimDisconnect: true }),
  injected({ shimDisconnect: true }),
]
if (shouldUseAnvilFork) {
  connectors.push(
    customMock({
      accounts: [defaultAnvilAccount],
    })
  )
}

export const wagmiAdapter = new WagmiAdapter({
  projectId: walletConnectProjectId,
  networks: chains,
  transports,
  connectors,
  ssr: true,
})

/*
  - Updates the mock connector address with the given impersonation address

  - When shouldUseAnvilFork:
    1. updates all chains to use the default Anvil fork RPC URL
    2. updates all transports to use the default Anvil fork RPC URL

  - Returns the updated wagmiConfig to be used for testing
*/
export function impersonateWagmiConfig(impersonationAddress?: Address) {
  console.log('🛠️ Using anvil forks in wagmi chain setup')

  /* All chains use the same RPC URL for the Anvil fork for local testing
      For now, E2E dev tests will always run against MAINNET fork
      If needed, this could be easily extended to use different RPC URLs for different chains
     */
  const updatedChains = chains.map(chain => ({
    ...chain,
    rpcUrls: {
      ...chain.rpcUrls,
      default: {
        ...chain.rpcUrls.default,
        http: [defaultAnvilForkRpcUrl],
      },
    },
  }))
  const _transports = Object.fromEntries(
    updatedChains.map(chain => [chain.id, http(defaultAnvilForkRpcUrl)])
  )
  console.log(
    'All chains and transports updated to use default Anvil fork RPC URL: ',
    defaultAnvilForkRpcUrl
  )

  const impersonatedConfig = new WagmiAdapter({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    projectId: walletConnectProjectId!,
    networks: updatedChains,
    transports: _transports,
    connectors,
    ssr: true,
  })

  removeExistingMockConnector(connectors)

  connectors.push(
    customMock(
      {
        accounts: [impersonationAddress || defaultAnvilAccount],
        features: { defaultConnected: false },
      },
      { chains: updatedChains as unknown as [Chain, ...Chain[]] }
    )
  )

  return { connectors, updatedConfig: impersonatedConfig }
}

function removeExistingMockConnector(connectors: CreateConnectorFn[]) {
  const mockConnectorIndex = connectors.findIndex(connector => connector({} as any).id === 'mock')
  if (mockConnectorIndex >= -1) {
    // Remove the existing mock connector by index
    connectors.splice(mockConnectorIndex, 1)
  }
}
