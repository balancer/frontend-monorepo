import { Button, HStack, IconButton, useDisclosure, Divider, VStack } from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { usePoolCreationFormSteps } from './usePoolCreationFormSteps'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { validatePoolTokens, validatePoolType } from './validatePoolCreationForm'
import { usePoolCreationForm } from './PoolCreationFormProvider'
import { PoolCreationTransactionsProvider } from './modal/PoolCreationTransactionsProvider'
import { PoolCreationModal } from './modal/PoolCreationModal'
import { useRef, useEffect } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '../../../local-storage/local-storage.constants'
import { Address } from 'viem'

export function PoolCreationFormAction({ disabled }: { disabled?: boolean }) {
  const { previousStep, nextStep, isLastStep, isFirstStep } = usePoolCreationFormSteps()
  const previewModalDisclosure = useDisclosure()
  const { isConnected } = useUserAccount()
  const nextBtn = useRef(null)

  const [poolAddress] = useLocalStorage<Address | undefined>(
    LS_KEYS.PoolCreation.Address,
    undefined
  )

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

      {isLastStep && (
        <PoolCreationTransactionsProvider>
          <PoolCreationModal
            finalFocusRef={nextBtn}
            isOpen={previewModalDisclosure.isOpen}
            onClose={previewModalDisclosure.onClose}
            onOpen={previewModalDisclosure.onOpen}
          />
        </PoolCreationTransactionsProvider>
      )}
    </>
  )
}

function InvalidTotalWeightAlert() {
  const { poolTokens, poolType } = usePoolCreationForm()

  const isTotalWeightTooLow = validatePoolTokens.isTotalWeightTooLow(poolTokens)
  const isTotalWeightTooHigh = validatePoolTokens.isTotalWeightTooHigh(poolTokens)
  const isWeightedPool = validatePoolType.isWeightedPool(poolType)

  if (!isWeightedPool) return null

  if (isTotalWeightTooLow) {
    return (
      <BalAlert
        content="To create a weighted pool, the sum of all the weights of the tokens must tally exactly 100%"
        status="warning"
        title="Token weights must tally 100%"
      />
    )
  }

  if (isTotalWeightTooHigh) {
    return (
      <BalAlert
        content="To create a weighted pool, the sum of all the weights of the tokens must tally exactly 100%"
        status="error"
        title="Token weights must tally 100%"
      />
    )
  }
}
