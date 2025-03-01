import { VStack, Text, Input, Button } from '@chakra-ui/react'
import { useWagmiConfig } from './WagmiConfigProvider'
import { useState } from 'react'
import { useConnect } from 'wagmi'
import { isAddress } from 'viem'
import { updateMockConnectorAddress } from './WagmiConfig'

export function ImpersonateAccount() {
  const { setWagmiConfig } = useWagmiConfig()
  const [isValidAddress, setIsValidAddress] = useState<boolean>(false)
  const { connectors, connectAsync } = useConnect()

  function onAddressChange(address: string) {
    if (isAddress(address)) {
      setIsValidAddress(true)
      return setWagmiConfig(updateMockConnectorAddress(address))
    }
    setIsValidAddress(false)
  }

  async function connectMockAccount() {
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
        disabled={!isValidAddress}
        onClick={() => connectMockAccount()}
      >
        Connect
      </Button>
    </VStack>
  )
}
