import { RainbowKitDetails } from '@rainbow-me/rainbowkit/dist/wallets/Wallet'
import { Address } from 'viem'
import { CreateConnectorFn, mock } from 'wagmi'

type Params = { index: number; address?: Address }

export function createMockConnector({ index, address }: Params) {
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
      ...mock({
        accounts: [
          address
            ? address
            : // Navigate to /debug/impersonate or edit the following address to impersonate with a different account
              '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Default anvil account
        ],
        features: {},
      })(config),
      rkDetails,
    }
  }

  return mockConnector
}
