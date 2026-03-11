import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { DialogRootProps, Dialog, Portal, VStack, Button, HStack, Text } from '@chakra-ui/react'
import { RefObject, useRef } from 'react'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
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
import { getPoolPath } from '@repo/lib/modules/pool/pool.utils'
import { getGqlPoolType } from '../helpers'
import { useIsPoolInitialized } from '@repo/lib/modules/pool/queries/useIsPoolInitialized'
import { useCreatePoolInput } from './useCreatePoolInput'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { useInitializePoolInput } from './useInitializePoolInput'
import { RestartPoolCreationModal } from './RestartPoolCreationModal'
import { useWatch } from 'react-hook-form'
import { usePoolCreationTransactions } from './usePoolCreationTransactions'

type PoolCreationModalProps = {
  open: boolean
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
}

export function PoolCreationModal({
  open,
  onClose,
  finalFocusRef,
  ...rest
}: PoolCreationModalProps & Omit<DialogRootProps, 'children'>) {
  const { poolCreationForm, resetPoolCreationForm, poolAddress, setPoolAddress } =
    usePoolCreationForm()
  const [network, poolType] = useWatch({
    control: poolCreationForm.control,
    name: ['network', 'poolType'],
  })
  const chainId = getChainId(network)

  const createPoolInput = useCreatePoolInput(chainId)
  const protocolVersion = createPoolInput.protocolVersion
  const initPoolInput = useInitializePoolInput(chainId)

  const { transactionSteps, initPoolTxHash, urlTxHash } = usePoolCreationTransactions({
    poolAddress,
    setPoolAddress,
    createPoolInput,
    initPoolInput,
  })

  const { isPoolInitialized } = useIsPoolInitialized({ chainId, poolAddress, poolType })

  const handleReset = () => {
    transactionSteps.resetTransactionSteps()
    resetPoolCreationForm()
    onClose()
  }

  const poolPath = getPoolPath({
    id: poolAddress as Address,
    chain: network,
    type: getGqlPoolType(poolType),
    protocolVersion,
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
    <Dialog.Root
      finalFocusEl={() => finalFocusRef?.current}
      initialFocusEl={() => initialFocusRef.current}
      open={open}
      placement="center"
      trapFocus={!isPoolInitialized}
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
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <PoolSummary transactionSteps={transactionSteps} />

              {isPoolInitialized && (
                <VStack width="full">
                  <Button
                    disabled={false}
                    loading={false}
                    marginTop="4"
                    onClick={() => window.open(poolPath, '_blank')}
                    size="lg"
                    variant="primary"
                    w="full"
                    width="full"
                  >
                    <HStack gap="sm" justifyContent="center" width="100%">
                      <Text color="font.primaryGradient" fontWeight="bold">
                        View pool page
                      </Text>
                    </HStack>
                  </Button>
                  <Button
                    disabled={false}
                    loading={false}
                    marginTop="2"
                    onClick={handleReset}
                    size="lg"
                    variant="secondary"
                    w="full"
                    width="full"
                  >
                    <HStack gap="sm" justifyContent="center" width="100%">
                      <Text color="font.primaryGradient" fontWeight="bold">
                        Create another pool
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
            ) : (
              <ActionModalFooter
                currentStep={transactionSteps.currentStep}
                isSuccess={isPoolInitialized}
                returnAction={redirectToPoolPage}
                returnLabel="View pool page"
                urlTxHash={urlTxHash}
              />
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
