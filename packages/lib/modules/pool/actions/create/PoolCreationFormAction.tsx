import { Button, HStack, IconButton, useDisclosure, Divider, VStack } from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { usePoolCreationFormSteps } from './usePoolCreationFormSteps'
import { usePoolCreationForm } from './PoolCreationFormProvider'
import { PoolCreationModal } from './modal/PoolCreationModal'
import { useRef, useEffect } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '../../../local-storage/local-storage.constants'
import { Address } from 'viem'
import { InvalidTotalWeightAlert } from './InvalidTotalWeightAlert'

export function PoolCreationFormAction({ disabled }: { disabled?: boolean }) {
  const [poolAddress] = useLocalStorage<Address | undefined>(
    LS_KEYS.PoolCreation.Address,
    undefined
  )

  const { isFormStateValid } = usePoolCreationForm()
  const { previousStep, nextStep, isLastStep, isFirstStep } = usePoolCreationFormSteps()
  const previewModalDisclosure = useDisclosure()
  const { isConnected } = useUserAccount()
  const nextBtn = useRef(null)

  useEffect(() => {
    // trigger modal open if user has begun pool creation process
    if (poolAddress && isLastStep) previewModalDisclosure.onOpen()
  }, [poolAddress])

  if (!isConnected) return <ConnectWallet variant="primary" w="full" />

  return (
    <>
      <VStack spacing="lg" w="full">
        <Divider />

        <InvalidTotalWeightAlert />

        <HStack spacing="md" w="full">
          {!isFirstStep && (
            <IconButton
              aria-label="Back"
              icon={<ChevronLeftIcon h="8" w="8" />}
              onClick={previousStep}
              size="lg"
            />
          )}

          <Button
            disabled={disabled}
            onClick={() => {
              if (isLastStep) {
                previewModalDisclosure.onOpen()
              } else {
                nextStep()
              }
            }}
            size="lg"
            variant="primary"
            w="full"
          >
            {isLastStep ? 'Create Pool' : 'Next'}
          </Button>
        </HStack>
      </VStack>

      {isFormStateValid && isLastStep && (
        <PoolCreationModal
          finalFocusRef={nextBtn}
          isOpen={previewModalDisclosure.isOpen}
          onClose={previewModalDisclosure.onClose}
          onOpen={previewModalDisclosure.onOpen}
        />
      )}
    </>
  )
}
