'use client'

import { Button, HStack, IconButton, useDisclosure } from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { useLbpForm } from './LbpFormProvider'
import { LbpCreationModal } from './modal/LbpCreationModal'
import { useRef } from 'react'
import { useUserAccount } from '../web3/UserAccountProvider'
import { ConnectWallet } from '../web3/ConnectWallet'
import { useCopyToClipboard } from '@repo/lib/shared/hooks/useCopyToClipboard'
import { useFormState, useWatch } from 'react-hook-form'

export function LbpFormAction({ disabled }: { disabled?: boolean }) {
  const { isConnected } = useUserAccount()
  const {
    activeStepIndex,
    setActiveStep,
    isLastStep,
    isFirstStep,
    saleStructureForm,
    projectInfoForm,
    poolAddress,
  } = useLbpForm()
  const selectedChain = useWatch({ control: saleStructureForm.control, name: 'selectedChain' })
  const previewModalDisclosure = useDisclosure()
  const nextBtn = useRef(null)
  const { copyToClipboard, isCopied } = useCopyToClipboard()
  const saleFormState = useFormState({ control: saleStructureForm.control })
  const projectInfoFormState = useFormState({ control: projectInfoForm.control })
  const isFormStateValid = saleFormState.isValid && projectInfoFormState.isValid

  if (!isConnected) return <ConnectWallet variant="primary" w="full" />

  const formButtonText = isLastStep ? `${poolAddress ? 'Initialize' : 'Create'} LBP` : 'Next'
  const initializeUrl = `${window.location.origin}/lbp/create/${selectedChain}/${poolAddress}`

  return (
    <HStack spacing="md" w="full">
      {!isFirstStep && (
        <IconButton
          aria-label="Back"
          icon={<ChevronLeftIcon h="8" w="8" />}
          onClick={() => setActiveStep(activeStepIndex - 1)}
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
            setActiveStep(activeStepIndex + 1)
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
          isOpen={previewModalDisclosure.isOpen}
          onClose={previewModalDisclosure.onClose}
          onOpen={previewModalDisclosure.onOpen}
        />
      )}
    </HStack>
  )
}
