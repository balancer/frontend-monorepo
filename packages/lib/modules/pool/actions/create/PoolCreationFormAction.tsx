import { Button, HStack, IconButton, useDisclosure, Divider, VStack } from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { usePoolCreationFormSteps } from './usePoolCreationFormSteps'
import { usePoolCreationForm } from './PoolCreationFormProvider'
import { PoolCreationModal } from './modal/PoolCreationModal'
import { useRef, useEffect } from 'react'
import { InvalidTotalWeightAlert } from './InvalidTotalWeightAlert'
import { useCopyToClipboard } from '@repo/lib/shared/hooks/useCopyToClipboard'

export function PoolCreationFormAction({ disabled }: { disabled?: boolean }) {
  const { isFormStateValid, poolAddress, isReClamm, poolTokens, network, poolType } =
    usePoolCreationForm()
  const { previousStep, nextStep, isLastStep, isFirstStep } = usePoolCreationFormSteps()
  const previewModalDisclosure = useDisclosure()
  const { isConnected } = useUserAccount()
  const nextBtn = useRef(null)
  const { copyToClipboard, isCopied } = useCopyToClipboard()

  const hasTokenAmounts = poolTokens.every(token => token.amount)

  useEffect(() => {
    // trigger modal close if reclamm and token amounts have not been set
    if (poolAddress && isReClamm && !hasTokenAmounts) previewModalDisclosure.onClose()
  }, [poolAddress, isReClamm, hasTokenAmounts])

  if (!isConnected) return <ConnectWallet variant="primary" w="full" />

  const buttonText = isLastStep ? (poolAddress ? 'Initialize Pool' : 'Create Pool') : 'Next'
  const showBackButton = !isFirstStep && !poolAddress

  const initializeUrl = `${window.location.origin}/create/${network}/${poolType}/${poolAddress}`

  return (
    <>
      <VStack spacing="lg" w="full">
        <Divider />

        <InvalidTotalWeightAlert />

        <HStack spacing="md" w="full">
          {showBackButton && (
            <IconButton
              aria-label="Back"
              icon={<ChevronLeftIcon h="8" w="8" />}
              onClick={previousStep}
              size="lg"
            />
          )}

          {poolAddress && (
            <Button
              onClick={() => copyToClipboard(initializeUrl)}
              size="lg"
              variant="secondary"
              w="full"
            >
              {isCopied ? 'Copied ✓' : 'Copy Link'}
            </Button>
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
            {buttonText}
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
