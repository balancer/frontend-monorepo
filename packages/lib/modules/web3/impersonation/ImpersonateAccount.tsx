import { Button, Input, Text, VStack } from '@chakra-ui/react'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { useState } from 'react'
import { Address, isAddress } from 'viem'
import { useImpersonateAccount } from './useImpersonateAccount'

export function ImpersonateAccount() {
  const [impersonatedAddress, setImpersonatedAddress] = useState<string>(defaultAnvilAccount)
  const { impersonateAccount } = useImpersonateAccount()

  return (
    <VStack>
      <Text>Impersonate Account</Text>
      <Input
        aria-label="Mock address"
        onChange={e => setImpersonatedAddress(e.target.value || '')}
        type="text"
        value={impersonatedAddress ?? ''}
        width="450px"
      />
      <Button
        aria-label="Impersonate"
        disabled={!isAddress(impersonatedAddress)}
        onClick={() => impersonateAccount({ impersonatedAddress: impersonatedAddress as Address })}
      >
        Connect
      </Button>
    </VStack>
  )
}
