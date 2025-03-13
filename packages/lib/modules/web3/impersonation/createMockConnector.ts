import { RainbowKitDetails } from '@rainbow-me/rainbowkit/dist/wallets/Wallet'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { Address } from 'viem'
import { CreateConnectorFn } from 'wagmi'
import { customMock } from './customMock'

type Params = { index: number; impersonationAddress?: Address }

export function createMockConnector({ index, impersonationAddress }: Params) {
  // Default WC RkDetails
  const rkDetails: RainbowKitDetails = {
    id: 'mock',
    name: 'Mock Connector',
    iconBackground: '#39FF14',
    iconUrl: async () => '/images/logos/mock.svg',
    index,
    groupIndex: 1,
    groupName: 'Recommended',
    isRainbowKitConnector: true,
  }

  const mockConnector: CreateConnectorFn = (config: any) => {
    return {
      ...customMock(
        {
          accounts: [
            impersonationAddress
              ? impersonationAddress
              : // Navigate to /debug/impersonate or edit the following address to impersonate with a different account
                defaultAnvilAccount,
          ],
          features: {},
        },
        { impersonationAddress }
      )(config),
      rkDetails,
    }
  }

  return mockConnector
}
