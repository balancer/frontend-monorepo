'use client'

import { Button, HStack, IconButton, useDisclosure, Icon } from '@chakra-ui/react';
import { useLbpForm } from './LbpFormProvider'
import { LbpCreationModal } from './modal/LbpCreationModal'
import { useRef } from 'react'
import { useUserAccount } from '../web3/UserAccountProvider'
import { ConnectWallet } from '../web3/ConnectWallet'
import { useCopyToClipboard } from '@repo/lib/shared/hooks/useCopyToClipboard'
import { useFormState, useWatch } from 'react-hook-form'
import { LuChevronLeft } from 'react-icons/lu';

export function LbpFormAction({ disabled }: { disabled?: boolean }) {
  const { isConnected } = useUserAccount()
  const {
    isLastStep,
    isFirstStep,
    goToNextStep,
    goToPreviousStep,
    saleStructureForm,
    poolAddress } = useLbpForm()
  const selectedChain = useWatch({ control: saleStructureForm.control, name: 'selectedChain' })
  const previewModalDisclosure = useDisclosure()
  const nextBtn = useRef(null)
  const { copyToClipboard, isCopied } = useCopyToClipboard()
  const saleFormState = useFormState({ control: saleStructureForm.control })
  const isFormStateValid = saleFormState.isValid

  if (!isConnected) return <ConnectWallet variant="primary" w="full" />

  const formButtonText = isLastStep ? `${poolAddress ? 'Initialize' : 'Create'} LBP` : 'Next'
  const initializeUrl = `${window.location.origin}/lbp/create/${selectedChain}/${poolAddress}`

  return (
    <HStack gap="md" w="full">
      {!isFirstStep && (
        <IconButton aria-label="Back" onClick={goToPreviousStep} size="lg"><Icon h="8" w="8" asChild><LuChevronLeft /></Icon></IconButton>
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
            goToNextStep()
          }
        }}
        size="lg"
        variant="primary"
        w="full"
      >
        {formButtonText}
      </Button>
      {isFormStateValid && isLastStep && (
        <LbpCreationModal
          finalFocusRef={nextBtn}
          isOpen={previewModalDisclosure.open}
          onClose={previewModalDisclosure.onClose}
          onOpen={previewModalDisclosure.onOpen}
        />
      )}
    </HStack>
  );
}
