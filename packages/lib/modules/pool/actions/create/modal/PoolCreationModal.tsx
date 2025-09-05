import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useRef } from 'react'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { VStack, Button, HStack, Text } from '@chakra-ui/react'
import { Address } from 'viem'
import { useRedirect } from '@repo/lib/shared/hooks/useRedirect'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { getChainName } from '@repo/lib/config/app.config'
import { useShouldBatchTransactions } from '@repo/lib/modules/web3/safe.hooks'
import { PoolSummary } from './PoolSummary'
import { ToggleHyperBlockSize } from './ToggleHyperBlockSize'
import { useHyperEvm } from '@repo/lib/modules/chains/hyperevm/useHyperEvm'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { getChainId } from '@repo/lib/config/app.config'
import { usePoolCreationTransactions } from './usePoolCreationTransactions'
import { getPoolPath } from '@repo/lib/modules/pool/pool.utils'
import { getGqlPoolType } from '../helpers'
import { useIsPoolInitialized } from '@repo/lib/modules/pool/queries/useIsPoolInitialized'
import { useCreatePoolInput } from './useCreatePoolInput'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { useInitializePoolInput } from './useInitializePoolInput'
import { RestartPoolCreationModal } from './RestartPoolCreationModal'

type PoolCreationModalProps = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
}

export function PoolCreationModal({
  isOpen,
  onClose,
  finalFocusRef,
  ...rest
}: PoolCreationModalProps & Omit<ModalProps, 'children'>) {
  const [poolAddress, setPoolAddress] = useLocalStorage<Address | undefined>(
    LS_KEYS.PoolCreation.Address,
    undefined
  )

  const { network, poolType, resetPoolCreationForm } = usePoolCreationForm()
  const chainId = getChainId(network)

  const createPoolInput = useCreatePoolInput(chainId)
  const initPoolInput = useInitializePoolInput(chainId)

  const { transactionSteps, initPoolTxHash, urlTxHash } = usePoolCreationTransactions({
    poolAddress,
    setPoolAddress,
    createPoolInput,
    initPoolInput,
  })

  const { isPoolInitialized } = useIsPoolInitialized(chainId, poolAddress)

  const handleReset = () => {
    transactionSteps.resetTransactionSteps()
    resetPoolCreationForm()
    onClose()
  }

  const poolPath = getPoolPath({
    id: poolAddress as Address,
    chain: network,
    type: getGqlPoolType(poolType),
    protocolVersion: 3 as const,
  })

  const initialFocusRef = useRef(null)
  const { isDesktop } = useBreakpoints()
  const shouldBatchTransactions = useShouldBatchTransactions()

  const { redirectToPage: redirectToPoolPage } = useRedirect(poolPath)

  const {
    shouldUseBigBlocks,
    shouldToggleBlockSize,
    setUsingBigBlocks,
    isSetUsingBigBlocksPending,
    setUsingBigBlocksError,
  } = useHyperEvm({
    isContractDeploymentStep: transactionSteps.currentStepIndex === 0,
    isHyperEvmTx: network === GqlChain.Hyperevm,
  })

  return (
    <Modal
      finalFocusRef={finalFocusRef}
      initialFocusRef={initialFocusRef}
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      preserveScrollBarGap
      trapFocus={!isPoolInitialized}
      {...rest}
    >
      <SuccessOverlay startAnimation={!!initPoolTxHash} />

      <ModalContent>
        {isDesktop && (
          <VStack>
            <DesktopStepTracker
              chain={network}
              isTxBatch={shouldBatchTransactions}
              transactionSteps={transactionSteps}
            />
            {!isPoolInitialized && (
              <RestartPoolCreationModal
                handleRestart={handleReset}
                isAbsolutePosition
                modalTitle="Abandon pool set up"
                network={network}
                poolAddress={poolAddress}
                poolType={getGqlPoolType(poolType)}
                triggerTitle="Abandon pool set up"
              />
            )}
          </VStack>
        )}
        <TransactionModalHeader
          chain={network}
          label={`Create pool on ${getChainName(network)}`}
          txHash={initPoolTxHash}
        />
        <ModalCloseButton />
        <ModalBody>
          <PoolSummary transactionSteps={transactionSteps} />

          {isPoolInitialized && (
            <VStack width="full">
              <Button
                isDisabled={false}
                isLoading={false}
                marginTop="4"
                onClick={() => window.open(poolPath, '_blank')}
                size="lg"
                variant="primary"
                w="full"
                width="full"
              >
                <HStack justifyContent="center" spacing="sm" width="100%">
                  <Text color="font.primaryGradient" fontWeight="bold">
                    View pool page
                  </Text>
                </HStack>
              </Button>
              <Button
                isDisabled={false}
                isLoading={false}
                marginTop="2"
                onClick={handleReset}
                size="lg"
                variant="secondary"
                w="full"
                width="full"
              >
                <HStack justifyContent="center" spacing="sm" width="100%">
                  <Text color="font.primaryGradient" fontWeight="bold">
                    Create another pool
                  </Text>
                </HStack>
              </Button>
            </VStack>
          )}
        </ModalBody>

        {shouldToggleBlockSize ? (
          <ToggleHyperBlockSize
            isSetUsingBigBlocksPending={isSetUsingBigBlocksPending}
            setUsingBigBlocks={setUsingBigBlocks}
            setUsingBigBlocksError={setUsingBigBlocksError}
            shouldUseBigBlocks={shouldUseBigBlocks}
          />
        ) : (
          <ActionModalFooter
            currentStep={transactionSteps.currentStep}
            isSuccess={isPoolInitialized}
            returnAction={redirectToPoolPage}
            returnLabel="View pool page"
            urlTxHash={urlTxHash}
          />
        )}
      </ModalContent>
    </Modal>
  )
}
