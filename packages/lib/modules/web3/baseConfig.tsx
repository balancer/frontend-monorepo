import { Button } from '@chakra-ui/react'
import { base, gnosis, mainnet, sepolia } from 'viem/chains'
import { createConfig, http, useConnect, useDisconnect, useEnsName } from 'wagmi'
import { injected, safe, walletConnect } from 'wagmi/connectors'
import { useUserAccount } from './UserAccountProvider'

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID
if (!walletConnectProjectId) throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_ID env')

export const baseConfig = createConfig({
  chains: [mainnet, base, sepolia, gnosis],
  connectors: [
    injected(),
    walletConnect({ projectId: walletConnectProjectId }),
    // metaMask(),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
    [gnosis.id]: http(),
  },
})

export function WalletOptions() {
  const { connectors, connect } = useConnect()

  return connectors.map(connector => (
    <Button key={connector.uid} onClick={() => connect({ connector })}>
      {connector.name}
    </Button>
  ))
}

export function Account() {
  const { userAddress } = useUserAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address: userAddress })

  return (
    <div>
      {userAddress && <div>{ensName ? `${ensName} (${userAddress})` : userAddress}</div>}
      <Button onClick={() => disconnect()}>Disconnect</Button>
    </div>
  )
}

export function ConnectWallet2() {
  const { isConnected } = useUserAccount()
  if (isConnected) return <Account />
  return <WalletOptions />
}
