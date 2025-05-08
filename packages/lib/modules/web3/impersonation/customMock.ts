import { MockParameters, mock } from 'wagmi/connectors'
import { clearImpersonatedAddressLS } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { Address, Chain, Transport } from 'viem'
import { CreateConnectorFn } from 'wagmi'

type CustomMockOptions = {
  chains?: [Chain, ...Chain[]]
  impersonationAddress?: Address
}

type ConnectorConfig = {
  chains: readonly [Chain, ...Chain[]]
  transports?: Record<number, Transport> | undefined
  emitter: any
}
/*
  Wrapper over wagmi mock to override some methods and to define custom chain RPC urls
 */
export function customMock(
  originalParameters: MockParameters,
  options: CustomMockOptions = {}
): CreateConnectorFn {
  const originalMock = mock({ ...originalParameters })

  return (config: ConnectorConfig) => {
    const updatedConfig = { ...config }

    if (options.chains && updatedConfig.chains) {
      updatedConfig.chains = options.chains
    }

    const connector = originalMock(updatedConfig)

    const originalDisconnect = connector.disconnect.bind(connector)
    connector.disconnect = async () => {
      clearImpersonatedAddressLS()
      await originalDisconnect()
      // When disconnecting from impersonated mock connector we need a full page reload to enforce AppKit connector state to be cleared
      window.location.reload()
    }

    // Add impersonated address to the list of accounts to allow non default anvil accounts to approve and run transactions
    if (options.impersonationAddress) {
      const originalGetAccounts = connector.getAccounts.bind(connector)
      connector.getAccounts = async () => {
        const originalAccounts = await originalGetAccounts()
        return [options.impersonationAddress, ...originalAccounts] as readonly Address[]
      }
    }

    return connector
  }
}
