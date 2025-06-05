import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useRef, useEffect } from 'react'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useLbpForm } from '../LbpFormProvider'
import { LbpSummary } from './LbpSummary'
import { useLbpCreation } from '../LbpCreationProvider'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { usePoolCreationReceipt } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { VStack, Button, HStack, Text } from '@chakra-ui/react'
import { getPoolPath } from '@repo/lib/modules/pool/pool.utils'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { useRedirect } from '@repo/lib/shared/hooks/useRedirect'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { PoolCreationModalFooter } from '@repo/lib/shared/components/modals/PoolCreationModalFooter'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'

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
  const { saleStructureForm, projectInfoForm, setActiveStep } = useLbpForm()
  const { selectedChain } = saleStructureForm.getValues()
  const { userAddress } = useUserAccount()
  const { transactionSteps, lastTransaction, initLbpTxHash, urlTxHash, previewModalDisclosure } =
    useLbpCreation()

  const [, setStepIndex] = useLocalStorage(LS_KEYS.LbpConfig.StepIndex, 0)
  const [poolAddress] = useLocalStorage<`0x${string}` | undefined>(
    LS_KEYS.LbpConfig.Address,
    undefined
  )
  const handleReset = async () => {
    // clear local storage
    localStorage.removeItem(LS_KEYS.LbpConfig.SaleStructure)
    localStorage.removeItem(LS_KEYS.LbpConfig.ProjectInfo)
    localStorage.removeItem(LS_KEYS.LbpConfig.Address)
    localStorage.removeItem(LS_KEYS.LbpConfig.IsMetadataSent)
    setStepIndex(0)

    // clear temp state
    saleStructureForm.reset()
    projectInfoForm.reset()
    setActiveStep(0)

    // clear path
    if (initLbpTxHash) window.history.replaceState({}, '', '/')

    onClose() // close modal
  }

  const txReceipt = lastTransaction?.result

  // TODO: change to usePoolInitializationReceipt
  const receiptProps = usePoolCreationReceipt({
    txHash: initLbpTxHash,
    chain: selectedChain,
    userAddress: userAddress,
    protocolVersion: 3 as const,
    txReceipt,
  })

  const isSuccess = !!initLbpTxHash || !!urlTxHash
  const path = getPoolPath({
    id: poolAddress as `0x${string}`,
    chain: selectedChain,
    type: GqlPoolType.LiquidityBootstrapping,
    protocolVersion: 3 as const,
  })

  const { redirectToPage: redirectToPoolPage } = useRedirect(path)

  useEffect(() => {
    // trigger modal open if user has begun pool creation process
    if (poolAddress) previewModalDisclosure.onOpen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolAddress])

  useEffect(() => {
    if (initLbpTxHash && !window.location.pathname.includes(initLbpTxHash)) {
      window.history.replaceState({}, '', `./create/${initLbpTxHash}`)
    }
  }, [initLbpTxHash])

  console.log('initLbpTxHash', initLbpTxHash)

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
          isReceiptLoading={receiptProps.isLoading}
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
                onClick={() => {
                  redirectToPoolPage()
                  // TODO: fix form reset
                  // setTimeout callback managed by browser event loop so will run after redirect?
                  // setTimeout(() => {
                  //   handleReset()
                  // }, 5000)
                }}
                size="lg"
                variant="secondary"
                w="full"
                width="full"
                marginTop="4"
              >
                <HStack justifyContent="center" spacing="sm" width="100%">
                  <Text color="font.primaryGradient" fontWeight="bold">
                    View LBP page
                  </Text>
                </HStack>
              </Button>
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
        {/* TODO: fix form reset */}
        {!isSuccess && <PoolCreationModalFooter onReset={handleReset} />}
      </ModalContent>
    </Modal>
  )
}
