import { MockParameters, mock } from 'wagmi/connectors'

import { Address } from 'viem'
import { CreateConnectorFn } from 'wagmi'
import { impersonateWagmiConfig } from '../WagmiConfig'

type CustomMockOptions = {
  impersonationAddress?: Address
}

/*
  Wrapper over wagmi mock to override getAccounts method
 */
export function customMock(
  originalParameters: MockParameters,
  options: CustomMockOptions = {}
): CreateConnectorFn {
  const originalMock = mock(originalParameters)

  return (config: any) => {
    const connector = originalMock(config)
    const originalConnect = connector.connect.bind(connector)

    // Add impersonated address to the list of accounts to allow non default anvil accounts to approve and run transactions
    if (options.impersonationAddress) {
      const originalGetAccounts = connector.getAccounts.bind(connector)
      connector.getAccounts = async () => {
        const originalAccounts = await originalGetAccounts()
        return [options.impersonationAddress, ...originalAccounts] as readonly Address[]
      }
    }

    connector.connect = params => {
      impersonateWagmiConfig(options.impersonationAddress)
      return originalConnect(params)
    }

    return connector
  }
}
