import { Button, HStack, VStack, Input } from '@chakra-ui/react'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { useState } from 'react'
import { Address, isAddress } from 'viem'
import { useImpersonateAccount } from './useImpersonateAccount'
import { useUserAccount } from '../UserAccountProvider'
import { useDisconnect } from 'wagmi'

export function ImpersonateAccount() {
  const [impersonatedAddress, setImpersonatedAddress] = useState<string>(defaultAnvilAccount)
  const { impersonateAccount } = useImpersonateAccount()
  const { userAddress, isConnected } = useUserAccount()
  const disconnect = useDisconnect()

  const impersonated = isConnected && impersonatedAddress === userAddress
  const impersonate = () =>
    impersonateAccount({ impersonatedAddress: impersonatedAddress as Address })

  return (
    <VStack>
      <Input
        aria-label="Mock address"
        onChange={e => setImpersonatedAddress(e.target.value || '')}
        type="text"
        value={impersonatedAddress ?? ''}
        width="450px"
      />
      <HStack>
        <Button
          aria-label="Impersonate button"
          disabled={!isAddress(impersonatedAddress)}
          onClick={!impersonated ? impersonate : () => disconnect.mutate()}
        >
          {!impersonated ? 'Connect' : 'Disconnect'}
        </Button>
      </HStack>
    </VStack>
  )
}
