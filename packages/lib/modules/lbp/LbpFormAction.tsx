'use client'

import { Button, HStack, IconButton, useDisclosure } from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { useLbpForm } from './LbpFormProvider'
import { LbpCreationModal } from './modal/LbpCreationModal'
import { useEffect, useRef } from 'react'
import { useUserAccount } from '../web3/UserAccountProvider'
import { ConnectWallet } from '../web3/ConnectWallet'
import { Address } from 'viem'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '../local-storage/local-storage.constants'
import { LbpCreationProvider } from './LbpCreationProvider'

export function LbpFormAction({ disabled }: { disabled?: boolean }) {
  const { isConnected } = useUserAccount()
  const { activeStepIndex, setActiveStep, isLastStep, isFirstStep } = useLbpForm()
  const previewModalDisclosure = useDisclosure()
  const nextBtn = useRef(null)

  const [poolAddress] = useLocalStorage<Address | undefined>(
    LS_KEYS.LbpConfig.PoolAddress,
    undefined
  )

  useEffect(() => {
    // trigger modal open if user has begun pool creation process
    if (poolAddress && isLastStep) previewModalDisclosure.onOpen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolAddress])

  return isConnected ? (
    <HStack spacing="md" w="full">
      {!isFirstStep && (
        <IconButton
          aria-label="Back"
          icon={<ChevronLeftIcon h="8" w="8" />}
          onClick={() => setActiveStep(activeStepIndex - 1)}
          size="lg"
        />
      )}

      <Button
        disabled={disabled}
        onClick={() => {
          if (isLastStep) {
            previewModalDisclosure.onOpen()
          } else {
            setActiveStep(activeStepIndex + 1)
          }
        }}
        size="lg"
        variant="primary"
        w="full"
      >
        {isLastStep ? 'Create LBP' : 'Next'}
      </Button>

      {isLastStep && (
        <LbpCreationProvider>
          <LbpCreationModal
            finalFocusRef={nextBtn}
            isOpen={previewModalDisclosure.isOpen}
            onClose={previewModalDisclosure.onClose}
            onOpen={previewModalDisclosure.onOpen}
          />
        </LbpCreationProvider>
      )}
    </HStack>
  ) : (
    <ConnectWallet variant="primary" w="full" />
  )
}
