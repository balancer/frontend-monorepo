import { Button, Input, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { Address, isAddress } from 'viem'
import { impersonateWagmiConfig, wagmiConfig } from '../WagmiConfig'
import { useWagmiConfig } from '../WagmiConfigProvider'
import { useImpersonateAccount } from './useImpersonateAccount'

export function ImpersonateAccount() {
  const { setWagmiConfig } = useWagmiConfig()
  const [impersonatedAddress, setImpersonatedAddress] = useState<Address | undefined>()
  const { impersonateAccount } = useImpersonateAccount()

  function onAddressChange(address: string) {
    if (isAddress(address)) {
      setImpersonatedAddress(address)

      return setWagmiConfig(impersonateWagmiConfig(address))
    }
    setImpersonatedAddress(undefined)
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
        onClick={() => impersonateAccount({ impersonatedAddress, wagmiConfig })}
      >
        Connect
      </Button>
    </VStack>
  )
}
