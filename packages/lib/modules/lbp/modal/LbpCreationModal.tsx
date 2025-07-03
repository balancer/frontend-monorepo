import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useRef, useEffect } from 'react'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useLbpForm } from '../LbpFormProvider'
import { LbpSummary } from './LbpSummary'
import { useLbpCreation } from '../LbpCreationProvider'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { VStack, Button, HStack, Text } from '@chakra-ui/react'
import { getPoolPath } from '@repo/lib/modules/pool/pool.utils'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { useRedirect } from '@repo/lib/shared/hooks/useRedirect'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { PoolCreationModalFooter } from '@repo/lib/shared/components/modals/PoolCreationModalFooter'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { Address } from 'viem'
import { useLbpMetadata } from '../useLbpMetadata'
import { useIsPoolInitialized } from '@repo/lib/modules/pool/queries/useIsPoolInitialized'
import { getChainId } from '@repo/lib/config/app.config'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
}

export function LbpCreationModal({
  isOpen,
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  const initialFocusRef = useRef(null)
  const { isDesktop } = useBreakpoints()
  const { saleStructureForm, resetLbpCreation } = useLbpForm()
  const { selectedChain } = saleStructureForm.getValues()
  const { transactionSteps, initLbpTxHash, urlTxHash } = useLbpCreation()

  const [poolAddress] = useLocalStorage<Address | undefined>(
    LS_KEYS.LbpConfig.PoolAddress,
    undefined
  )

  const {
    saveMetadata,
    error: saveMetadataError,
    isMetadataSaved,
    reset: resetSaveMetadata,
  } = useLbpMetadata()

  const hasAttemptedSaveMetadata = useRef(false)
  const chainId = getChainId(selectedChain)
  const { data: isPoolInitialized } = useIsPoolInitialized(chainId, poolAddress)

  const handleReset = () => {
    transactionSteps.resetTransactionSteps()
    resetLbpCreation()
    resetSaveMetadata()
    onClose()
  }

  const path = getPoolPath({
    id: poolAddress as Address,
    chain: selectedChain,
    type: GqlPoolType.LiquidityBootstrapping,
    protocolVersion: 3 as const,
  })

  const { redirectToPage: redirectToPoolPage } = useRedirect(path)

  useEffect(() => {
    const handleSaveMetadata = async () => {
      if (isPoolInitialized && !isMetadataSaved && !hasAttemptedSaveMetadata.current) {
        hasAttemptedSaveMetadata.current = true
        try {
          await saveMetadata()
        } catch (error) {
          console.error('Error saving metadata:', error)
        }
      }
    }
    handleSaveMetadata()
  }, [isPoolInitialized, isMetadataSaved, saveMetadata])

  if (saveMetadataError && !transactionSteps.steps.some(step => step.id === 'save-metadata')) {
    transactionSteps.steps.push({
      id: 'save-metadata',
      stepType: 'sendLbpMetadata' as const,
      details: {
        gasless: true,
        type: 'Offchain action',
      },
      labels: { init: 'Save metadata', title: 'Save metadata', tooltip: 'Save metadata' },
      isComplete: () => isMetadataSaved,
      renderAction: () => undefined,
    })
  }

  const isSuccess = !!isPoolInitialized && isMetadataSaved

  return (
    <Modal
      finalFocusRef={finalFocusRef}
      initialFocusRef={initialFocusRef}
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      preserveScrollBarGap
      trapFocus={!isSuccess}
      {...rest}
    >
      <SuccessOverlay startAnimation={!!initLbpTxHash} />

      <ModalContent>
        {isDesktop && (
          <DesktopStepTracker
            chain={selectedChain}
            // isTxBatch={shouldBatchTransactions} // TODO
            transactionSteps={transactionSteps}
          />
        )}
        <TransactionModalHeader
          chain={selectedChain}
          label={'Preview: Create an LBP'}
          txHash={initLbpTxHash}
        />
        <ModalCloseButton />
        <ModalBody>
          <LbpSummary />

          {isSuccess && (
            <VStack width="full">
              <Button
                isDisabled={false}
                isLoading={false}
                marginTop="4"
                onClick={() => window.open(path, '_blank')}
                size="lg"
                variant="secondary"
                w="full"
                width="full"
              >
                <HStack justifyContent="center" spacing="sm" width="100%">
                  <Text color="font.primaryGradient" fontWeight="bold">
                    View LBP page
                  </Text>
                </HStack>
              </Button>
              <Button
                isDisabled={false}
                isLoading={false}
                marginTop="2"
                onClick={handleReset}
                size="lg"
                variant="primary"
                w="full"
                width="full"
              >
                <HStack justifyContent="center" spacing="sm" width="100%">
                  <Text color="font.primaryGradient" fontWeight="bold">
                    Create another LBP
                  </Text>
                </HStack>
              </Button>
            </VStack>
          )}

          {!!saveMetadataError && (
            <VStack marginTop="4" spacing="3" width="full">
              <BalAlert
                content="The pool has been created and seeded onchain. However, there was an error syncing the metadata to the Balancer API. Your pool will not display on the Balancer UI until the sync is completed."
                status="error"
                title="Error syncing metadata"
              />
              <Button
                isDisabled={false}
                isLoading={false}
                onClick={saveMetadata}
                size="lg"
                variant="secondary"
                w="full"
              >
                <HStack justifyContent="center" spacing="sm" width="100%">
                  <Text color="font.primaryGradient" fontWeight="bold">
                    Retry sync metadata
                  </Text>
                </HStack>
              </Button>
            </VStack>
          )}
        </ModalBody>
        {!saveMetadataError && (
          <ActionModalFooter
            currentStep={transactionSteps.currentStep}
            isSuccess={isSuccess}
            returnAction={redirectToPoolPage}
            returnLabel="View pool page"
            urlTxHash={urlTxHash}
          />
        )}
        {!isSuccess && <PoolCreationModalFooter onReset={handleReset} />}
      </ModalContent>
    </Modal>
  )
}
