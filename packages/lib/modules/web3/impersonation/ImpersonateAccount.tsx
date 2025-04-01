import { Button, Input, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Address, isAddress } from 'viem'
import { impersonateWagmiConfig, wagmiConfig } from '../WagmiConfig'
import { useWagmiConfig } from '../WagmiConfigProvider'
import { useImpersonateAccount } from './useImpersonateAccount'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { shouldUseAnvilFork } from '@repo/lib/config/app.config'

export function ImpersonateAccount() {
  const { setWagmiConfig } = useWagmiConfig()
  const [impersonatedAddress, setImpersonatedAddress] = useState<string | undefined>(
    defaultAnvilAccount
  )
  const { impersonateAccount } = useImpersonateAccount()

  function onAddressChange(address: string) {
    setImpersonatedAddress(address)
    if (isAddress(address)) {
      return setWagmiConfig(impersonateWagmiConfig(address))
    }
  }

  useEffect(() => {
    if (shouldUseAnvilFork) {
      // Load default account
      setWagmiConfig(impersonateWagmiConfig(defaultAnvilAccount))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <VStack>
      <Text>Impersonate Account</Text>
      <Input
        aria-label="Mock address"
        onChange={e => onAddressChange(e.target.value)}
        type="text"
        value={impersonatedAddress ?? ''}
        width="450px"
      />
      <Button
        aria-label="Impersonate"
        disabled={!isAddress(impersonatedAddress || '')}
        onClick={() =>
          impersonateAccount({ impersonatedAddress: impersonatedAddress as Address, wagmiConfig })
        }
      >
        Connect
      </Button>
    </VStack>
  )
}
