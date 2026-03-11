import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { Dialog, Portal, VStack, Button, HStack, Text } from '@chakra-ui/react'
import { RefObject, useRef, useEffect } from 'react'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useLbpForm } from '../LbpFormProvider'
import { LbpSummary } from './LbpSummary'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { getPoolPath } from '@repo/lib/modules/pool/pool.utils'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { useRedirect } from '@repo/lib/shared/hooks/useRedirect'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { Address } from 'viem'
import { useLbpMetadata } from '../useLbpMetadata'
import { useIsPoolInitialized } from '@repo/lib/modules/pool/queries/useIsPoolInitialized'
import { getChainId } from '@repo/lib/config/app.config'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { useShouldBatchTransactions } from '@repo/lib/modules/web3/safe.hooks'
import { PoolCreationModalFooter } from '@repo/lib/shared/components/modals/PoolCreationModalFooter'
import { ToggleHyperBlockSize } from '@repo/lib/modules/pool/actions/create/modal/ToggleHyperBlockSize'
import { useHyperEvm } from '@repo/lib/modules/chains/hyperevm/useHyperEvm'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useCreateLbpInput } from '../useCreateLbpInput'
import { useInitializeLbpInput } from '../useInitializeLbpInput'
import { usePoolCreationTransactions } from '@repo/lib/modules/pool/actions/create/modal/usePoolCreationTransactions'

type Props = {
  open: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
}

export function LbpCreationModal({ open, onClose, finalFocusRef, ...rest }: Props) {
  const [poolAddress, setPoolAddress] = useLocalStorage<Address | undefined>(
    LS_KEYS.LbpConfig.PoolAddress,
    undefined
  )

  const initialFocusRef = useRef(null)
  const { isDesktop } = useBreakpoints()
  const { saleStructureForm, resetLbpCreation } = useLbpForm()
  const { selectedChain } = saleStructureForm.getValues()

  const createPoolInput = useCreateLbpInput()
  const initPoolInput = useInitializeLbpInput()
  const { transactionSteps, initPoolTxHash, urlTxHash } = usePoolCreationTransactions({
    poolAddress,
    setPoolAddress,
    createPoolInput,
    initPoolInput,
  })

  const shouldBatchTransactions = useShouldBatchTransactions()
  const {
    saveMetadata,
    error: saveMetadataError,
    isMetadataSaved,
    reset: resetSaveMetadata,
  } = useLbpMetadata()

  const hasAttemptedSaveMetadata = useRef(false)
  const chainId = getChainId(selectedChain)
  const { isPoolInitialized } = useIsPoolInitialized({ chainId, poolAddress })

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

  const {
    shouldUseBigBlocks,
    shouldToggleBlockSize,
    setUsingBigBlocks,
    isSetUsingBigBlocksPending,
    setUsingBigBlocksError,
  } = useHyperEvm({
    isContractDeploymentStep: transactionSteps.currentStepIndex === 0,
    isHyperEvmTx: selectedChain === GqlChain.Hyperevm,
  })

  return (
    <Dialog.Root
      finalFocusEl={() => finalFocusRef?.current || undefined}
      initialFocusEl={() => initialFocusRef.current}
      open={open}
      placement="center"
      trapFocus={!isSuccess}
      {...rest}
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) {
          onClose()
        }
      }}
    >
      <Portal>
        <SuccessOverlay startAnimation={!!initPoolTxHash} />
        <Dialog.Positioner>
          <Dialog.Content>
            {isDesktop && (
              <DesktopStepTracker
                chain={selectedChain}
                isTxBatch={shouldBatchTransactions}
                transactionSteps={transactionSteps}
              />
            )}
            <TransactionModalHeader
              chain={selectedChain}
              label={'Preview: Create an LBP'}
              txHash={initPoolTxHash}
            />
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <LbpSummary transactionSteps={transactionSteps} />

              {isSuccess && (
                <VStack width="full">
                  <Button
                    disabled={false}
                    loading={false}
                    marginTop="4"
                    onClick={() => window.open(path, '_blank')}
                    size="lg"
                    variant="secondary"
                    w="full"
                    width="full"
                  >
                    <HStack gap="sm" justifyContent="center" width="100%">
                      <Text color="font.primaryGradient" fontWeight="bold">
                        View LBP page
                      </Text>
                    </HStack>
                  </Button>
                  <Button
                    disabled={false}
                    loading={false}
                    marginTop="2"
                    onClick={handleReset}
                    size="lg"
                    variant="primary"
                    w="full"
                    width="full"
                  >
                    <HStack gap="sm" justifyContent="center" width="100%">
                      <Text color="font.primaryGradient" fontWeight="bold">
                        Create another LBP
                      </Text>
                    </HStack>
                  </Button>
                </VStack>
              )}

              {!!saveMetadataError && (
                <VStack gap="3" marginTop="4" width="full">
                  <BalAlert
                    content="The pool has been created and seeded onchain. However, there was an error syncing the metadata to the Balancer API. Your pool will not display on the Balancer UI until the sync is completed."
                    status="error"
                    title="Error syncing metadata"
                  />
                  <Button
                    disabled={false}
                    loading={false}
                    onClick={saveMetadata}
                    size="lg"
                    variant="secondary"
                    w="full"
                  >
                    <HStack gap="sm" justifyContent="center" width="100%">
                      <Text color="font.primaryGradient" fontWeight="bold">
                        Retry sync metadata
                      </Text>
                    </HStack>
                  </Button>
                </VStack>
              )}
            </Dialog.Body>
            {shouldToggleBlockSize ? (
              <ToggleHyperBlockSize
                isSetUsingBigBlocksPending={isSetUsingBigBlocksPending}
                setUsingBigBlocks={setUsingBigBlocks}
                setUsingBigBlocksError={setUsingBigBlocksError}
                shouldUseBigBlocks={shouldUseBigBlocks}
              />
            ) : !saveMetadataError ? (
              <ActionModalFooter
                currentStep={transactionSteps.currentStep}
                isSuccess={isSuccess}
                returnAction={redirectToPoolPage}
                returnLabel="View pool page"
                urlTxHash={urlTxHash}
              />
            ) : null}
            {!isSuccess && <PoolCreationModalFooter onReset={handleReset} />}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
