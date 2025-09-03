import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useRef } from 'react'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { VStack, Button, HStack, Text } from '@chakra-ui/react'
import { getPoolPath } from '@repo/lib/modules/pool/pool.utils'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { useRedirect } from '@repo/lib/shared/hooks/useRedirect'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { Address } from 'viem'
import { useIsPoolInitialized } from '@repo/lib/modules/pool/queries/useIsPoolInitialized'
import { getChainId, getChainName } from '@repo/lib/config/app.config'
import { useShouldBatchTransactions } from '@repo/lib/modules/web3/safe.hooks'
import { usePoolCreation } from './PoolCreationProvider'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { PoolType } from '@balancer/sdk'
import { PoolSummary } from './PoolSummary'
import { ToggleHyperBlockSize } from './ToggleHyperBlockSize'
import { useHyperEvm } from '@repo/lib/modules/chains/hyperevm/useHyperEvm'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

type Props = {
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
}: Props & Omit<ModalProps, 'children'>) {
  const initialFocusRef = useRef(null)
  const { isDesktop } = useBreakpoints()
  const { transactionSteps, initPoolTxHash, urlTxHash } = usePoolCreation()
  const { network, poolType, resetPoolCreationForm } = usePoolCreationForm()

  const [poolAddress] = useLocalStorage<Address | undefined>(
    LS_KEYS.PoolCreation.Address,
    undefined
  )

  const shouldBatchTransactions = useShouldBatchTransactions()

  const chainId = getChainId(network)
  const { data: isPoolInitialized } = useIsPoolInitialized(chainId, poolAddress)

  const handleReset = () => {
    transactionSteps.resetTransactionSteps()
    resetPoolCreationForm()
    onClose()
  }

  const poolTypeToGqlPoolType = {
    [PoolType.Stable]: GqlPoolType.Stable,
    [PoolType.StableSurge]: GqlPoolType.Stable,
    [PoolType.Weighted]: GqlPoolType.Weighted,
  }

  const path = getPoolPath({
    id: poolAddress as Address,
    chain: network,
    type: poolTypeToGqlPoolType[poolType as keyof typeof poolTypeToGqlPoolType],
    protocolVersion: 3 as const,
  })

  const { redirectToPage: redirectToPoolPage } = useRedirect(path)

  const isSuccess = !!isPoolInitialized

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
      trapFocus={!isSuccess}
      {...rest}
    >
      <SuccessOverlay startAnimation={!!initPoolTxHash} />

      <ModalContent>
        {isDesktop && (
          <DesktopStepTracker
            chain={network}
            isTxBatch={shouldBatchTransactions}
            transactionSteps={transactionSteps}
          />
        )}
        <TransactionModalHeader
          chain={network}
          label={`Create pool on ${getChainName(network)}`}
          txHash={initPoolTxHash}
        />
        <ModalCloseButton />
        <ModalBody>
          <PoolSummary />

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
            isSuccess={isSuccess}
            returnAction={redirectToPoolPage}
            returnLabel="View pool page"
            urlTxHash={urlTxHash}
          />
        )}
      </ModalContent>
    </Modal>
  )
}
