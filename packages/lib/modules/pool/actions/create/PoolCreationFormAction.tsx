import { Button, HStack, IconButton, useDisclosure, VStack, Separator, Icon } from '@chakra-ui/react';
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { usePoolCreationForm } from './PoolCreationFormProvider'
import { PoolCreationModal } from './modal/PoolCreationModal'
import { useRef, useEffect } from 'react'
import { InvalidTotalWeightAlert } from './InvalidTotalWeightAlert'
import { useCopyToClipboard } from '@repo/lib/shared/hooks/useCopyToClipboard'
import { isReClammPool, isCowPool } from './helpers'
import { useFormState, useWatch } from 'react-hook-form'
import { LuChevronLeft } from 'react-icons/lu';

export function PoolCreationFormAction({ disabled }: { disabled?: boolean }) {
  const { poolAddress, poolCreationForm, goToNextStep, goToPreviousStep, isLastStep, isFirstStep } =
    usePoolCreationForm()
  const [poolTokens, poolType, network] = useWatch({
    control: poolCreationForm.control,
    name: ['poolTokens', 'poolType', 'network'] })
  const formState = useFormState({ control: poolCreationForm.control })
  const previewModalDisclosure = useDisclosure()
  const { isConnected } = useUserAccount()
  const nextBtn = useRef(null)
  const { copyToClipboard, isCopied } = useCopyToClipboard()

  const hasTokenAmounts = poolTokens.every(token => token.amount)

  useEffect(() => {
    // trigger modal close if reclamm and token amounts have not been set
    if (poolAddress && isReClammPool(poolType) && !hasTokenAmounts) previewModalDisclosure.onClose()
  }, [poolAddress, poolType, hasTokenAmounts])

  if (!isConnected) return <ConnectWallet variant="primary" w="full" />

  const showBackButton = !isFirstStep && !poolAddress

  const initializeUrl = `${window.location.origin}/create/${network}/${poolType}/${poolAddress}`

  return (
    <>
      <VStack gap="lg" w="full">
        <Separator />

        <InvalidTotalWeightAlert />

        <HStack gap="md" w="full">
          {showBackButton && (
            <IconButton aria-label="Back" onClick={goToPreviousStep} size="lg"><Icon h="8" w="8" asChild><LuChevronLeft /></Icon></IconButton>
          )}

          {poolAddress && !isCowPool(poolType) && (
            <Button
              onClick={() => copyToClipboard(initializeUrl)}
              size="lg"
              variant="secondary"
              w="full"
            >
              {isCopied ? 'Copied ✓' : 'Copy Link'}
            </Button>
          )}

          {isLastStep ? (
            <Button
              disabled={disabled}
              onClick={previewModalDisclosure.onOpen}
              size="lg"
              variant="primary"
              w="full"
            >
              {poolAddress ? 'Initialize Pool' : 'Create Pool'}
            </Button>
          ) : (
            <Button disabled={disabled} onClick={goToNextStep} size="lg" variant="primary" w="full">
              Next
            </Button>
          )}
        </HStack>
      </VStack>
      {formState.isValid && isLastStep && (
        <PoolCreationModal
          finalFocusRef={nextBtn}
          isOpen={previewModalDisclosure.open}
          onClose={previewModalDisclosure.onClose}
          onOpen={previewModalDisclosure.onOpen}
        />
      )}
    </>
  );
}
