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
import { useSaveMetadata } from '../steps/useSaveMetadata'
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
  const { saleStructureForm, isLastStep: isLastConfigStep, resetLbpCreation } = useLbpForm()
  const { selectedChain } = saleStructureForm.getValues()
  const { transactionSteps, initLbpTxHash, urlTxHash, previewModalDisclosure } = useLbpCreation()

  const [poolAddress] = useLocalStorage<Address | undefined>(
    LS_KEYS.LbpConfig.PoolAddress,
    undefined
  )
  const [isMetadataSaved] = useLocalStorage<boolean>(LS_KEYS.LbpConfig.IsMetadataSaved, false)

  const handleReset = () => {
    resetLbpCreation()
    transactionSteps.resetTransactionSteps()
    onClose()
  }

  const path = getPoolPath({
    id: poolAddress as `0x${string}`,
    chain: selectedChain,
    type: GqlPoolType.LiquidityBootstrapping,
    protocolVersion: 3 as const,
  })

  const { redirectToPage: redirectToPoolPage } = useRedirect(path)

  useEffect(() => {
    // trigger modal open if user has begun pool creation process
    if (poolAddress && isLastConfigStep) previewModalDisclosure.onOpen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolAddress])

  const isInitializationSuccess = transactionSteps.lastTransactionConfirmed

  const { saveMetadata, errorMessage, errorTitle } = useSaveMetadata()

  const isSuccess = isInitializationSuccess && isMetadataSaved
  const isSaveMetadataError = errorMessage || errorTitle

  return (
    <>
      <Modal
        finalFocusRef={finalFocusRef}
        initialFocusRef={initialFocusRef}
        isCentered
        isOpen={isOpen}
        onClose={onClose}
        preserveScrollBarGap
        trapFocus={!isInitializationSuccess}
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
                  onClick={redirectToPoolPage}
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

            {isSaveMetadataError && (
              <VStack width="full">
                <Button
                  isDisabled={false}
                  isLoading={false}
                  marginTop="4"
                  onClick={saveMetadata}
                  size="lg"
                  variant="secondary"
                  w="full"
                  width="full"
                >
                  <HStack justifyContent="center" spacing="sm" width="100%">
                    <Text color="font.primaryGradient" fontWeight="bold">
                      Save metadata
                    </Text>
                  </HStack>
                </Button>
                <BalAlert content={errorMessage} status="error" title={errorTitle} />
              </VStack>
            )}
          </ModalBody>
          <ActionModalFooter
            currentStep={transactionSteps.currentStep}
            isSuccess={isSuccess}
            returnAction={redirectToPoolPage}
            returnLabel="View pool page"
            urlTxHash={urlTxHash}
          />
          {!isSuccess && <PoolCreationModalFooter onReset={handleReset} />}
        </ModalContent>
      </Modal>
    </>
  )
}
