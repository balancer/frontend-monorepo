import { Button, HStack, VStack, Input } from '@chakra-ui/react'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { useState } from 'react'
import { Address, isAddress } from 'viem'
import { useImpersonateAccount } from './useImpersonateAccount'
import { ImpersonatorSettings } from './ImpersonatorSettings'
import { useCurrentDate, useFakeTime } from '@repo/lib/shared/hooks/date.hooks'
import { oneSecondInMs } from '@repo/lib/shared/utils/time'

export function ImpersonateAccount() {
  const [impersonatedAddress, setImpersonatedAddress] = useState<string>(defaultAnvilAccount)
  const { impersonateAccount } = useImpersonateAccount()
  const currentDate = useCurrentDate(oneSecondInMs)
  const { isFakeTime, setIsFakeTime } = useFakeTime()

  return (
    <VStack>
      <Input
        aria-label="Mock address"
        onChange={e => setImpersonatedAddress(e.target.value || '')}
        type="text"
        value={impersonatedAddress ?? ''}
        width="400px"
      />
      <HStack>
        <Button
          aria-label="Impersonate"
          disabled={!isAddress(impersonatedAddress)}
          onClick={() =>
            impersonateAccount({ impersonatedAddress: impersonatedAddress as Address })
          }
        >
          Connect
        </Button>

        <ImpersonatorSettings
          impersonatedAddress={impersonatedAddress}
          setIsFakeTime={setIsFakeTime}
        />

        <div>{isFakeTime && <div>Fake date: {currentDate.toLocaleDateString()}</div>}</div>
      </HStack>
    </VStack>
  )
}
