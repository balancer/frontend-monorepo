import { Button, Input, Text, VStack } from '@chakra-ui/react'
import { shouldUseAnvilFork } from '@repo/lib/config/app.config'
import {
  defaultAnvilAccount,
  getSavedImpersonatedAddressLS,
} from '@repo/lib/test/utils/wagmi/fork.helpers'
import { useEffect, useRef, useState } from 'react'
import { Address, isAddress } from 'viem'
import { useConnect } from 'wagmi'
import { impersonateWagmiConfig, wagmiConfig } from '../WagmiConfig'
import { useWagmiConfig } from '../WagmiConfigProvider'
import { useImpersonateAccount } from './useImpersonateAccount'

export function ImpersonateAccount() {
  const { setWagmiConfig } = useWagmiConfig()
  const [impersonatedAddress, setImpersonatedAddress] = useState<string | undefined>(
    defaultAnvilAccount
  )
  const { impersonateAccount } = useImpersonateAccount()
  const { connectors, connectAsync } = useConnect()

  const storedImpersonatedAddress = useRef<string | undefined>(undefined)
  const isReconnectingImpersonatedAddress = useRef(false)

  function onAddressChange(address: string) {
    setImpersonatedAddress(address)
    if (isAddress(address)) {
      return setWagmiConfig(impersonateWagmiConfig(address))
    }
  }

  useEffect(() => {
    if (shouldUseAnvilFork) {
      const impersonatedAddress = getSavedImpersonatedAddressLS()
      if (impersonatedAddress) {
        storedImpersonatedAddress.current = impersonatedAddress
      }

      // Load default account
      setWagmiConfig(impersonateWagmiConfig(impersonatedAddress || defaultAnvilAccount))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (storedImpersonatedAddress.current && !isReconnectingImpersonatedAddress.current) {
      isReconnectingImpersonatedAddress.current = true
      connectAsync({ connector: connectors[connectors.length - 1], chainId: 1 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedImpersonatedAddress])

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
