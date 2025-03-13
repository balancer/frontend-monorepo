import { VStack, Text, Input, Button } from '@chakra-ui/react'
import { useWagmiConfig } from '../WagmiConfigProvider'
import { useState } from 'react'
import { useConnect } from 'wagmi'
import { Address, isAddress } from 'viem'
import { impersonateWagmiConfig } from '../WagmiConfig'
import { forkClient } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { shouldUseAnvilFork } from '@repo/lib/config/app.config'

export function ImpersonateAccount() {
  const { setWagmiConfig } = useWagmiConfig()
  const [impersonatedAddress, setImpersonatedAddress] = useState<Address | undefined>()
  const { connectors, connectAsync } = useConnect()

  function onAddressChange(address: string) {
    if (isAddress(address)) {
      setImpersonatedAddress(address)

      return setWagmiConfig(impersonateWagmiConfig(address))
    }
    setImpersonatedAddress(undefined)
  }

  async function connectMockAccount() {
    if (!impersonatedAddress) return
    // E2E dev tests impersonate account in the fork to be able to sign and run transactions against the anvil fork
    if (shouldUseAnvilFork) {
      await forkClient.impersonateAccount({
        address: impersonatedAddress,
      })
    }
    await connectAsync({ connector: connectors[connectors.length - 1] })
  }

  return (
    <VStack>
      <Text>Impersonate Account</Text>
      <Input
        aria-label="Mock address"
        onChange={e => onAddressChange(e.target.value)}
        type="text"
        width="40%"
      />
      <Button
        aria-label="Impersonate"
        disabled={!impersonatedAddress}
        onClick={() => connectMockAccount()}
      >
        Connect
      </Button>
    </VStack>
  )
}
