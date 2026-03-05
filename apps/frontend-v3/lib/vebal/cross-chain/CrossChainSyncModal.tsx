import {
  Card,
  Text,
  Button,
  VStack,
  Checkbox,
  HStack,
  Heading,
  Dialog,
  Portal } from '@chakra-ui/react';
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useState } from 'react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useCrossChainSyncSteps } from '@bal/lib/vebal/cross-chain/useCrossChainSyncSteps'
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { uniq } from 'lodash'
import { getChainShortName } from '@repo/lib/config/app.config'
import { useVebalUserData } from '@bal/lib/vebal/useVebalUserData'
import { useCrossChainSync } from './CrossChainSyncProvider'
import { formatUnits } from 'viem'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'

type Props = {
  isOpen: boolean
  onClose(): void
  networks: GqlChain[]
}

function NetworksSelectionStep({ networks, selectedNetworks, toggleNetwork }: NetworkOptionsProps) {
  const { veBALBalance } = useVebalUserData()

  return (
    <VStack gap="4">
      <Text variant="secondary">
        Layer 2 networks don’t know your veBAL balance from Ethereum, unless you sync it. Each
        network costs additional gas to sync, so it’s best to only sync networks where you plan to
        stake
      </Text>
      <Card.Root gap="4">
        <Heading>
          <HStack justifyContent="space-between" w="full">
            <Text>Ethereum</Text>
            <Text> {formatUnits(veBALBalance, 18)} veBAL</Text>
          </HStack>
        </Heading>
        <NetworkOptions
          networks={networks}
          selectedNetworks={selectedNetworks}
          toggleNetwork={toggleNetwork}
        />
      </Card.Root>
    </VStack>
  );
}

interface NetworkOptionsProps {
  networks: GqlChain[]
  selectedNetworks: GqlChain[]
  toggleNetwork: (checked: boolean, network: GqlChain) => void
}

function NetworkOptions({ networks, selectedNetworks, toggleNetwork }: NetworkOptionsProps) {
  const { l2VeBalBalances } = useCrossChainSync()
  return (
    <VStack align="start" gap="xs" w="full">
      {networks.map(network => (
        <Checkbox.Root
          key={`checkbox-${String(network)}`}
          onCheckedChange={(e: any) => toggleNetwork(e.target.checked, network)}
          checked={selectedNetworks.includes(network)}
        ><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Root><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Root></Checkbox.Label></Checkbox.Root><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label>
            <HStack w="full">
              <Text>{getChainShortName(network)}</Text>
              <Text>{l2VeBalBalances[network]} veBAL</Text>
            </HStack>
          </Checkbox.Label></Checkbox.Root></Checkbox.Label></Checkbox.Root>
      ))}
    </VStack>
  );
}

export function CrossChainSyncModal({ isOpen, onClose, networks }: Props) {
  const { refetch } = useCrossChainSync()
  const [selectedNetworks, setSelectedNetworks] = useState<GqlChain[]>([])
  const [showTransactionSteps, setShowTransactionSteps] = useState(false)
  const { isDesktop, isMobile } = useBreakpoints()

  const steps = useCrossChainSyncSteps({
    networks: selectedNetworks })
  const transactionSteps = useTransactionSteps(steps)

  const transactionHash = transactionSteps.lastTransaction?.result?.data?.transactionHash

  function onModalClose() {
    onClose()
    setSelectedNetworks([])
    setShowTransactionSteps(false)
    transactionSteps.resetTransactionSteps()
    refetch()
  }

  function toggleNetwork(checked: boolean, network: GqlChain) {
    if (checked) {
      setSelectedNetworks(current => uniq([...current, network]))
    } else {
      setSelectedNetworks(current => current.filter(chain => chain !== network))
    }
  }

  const isSuccess = !!transactionHash

  return (
    <Dialog.Root
      placement='center'
      open={isOpen}
      trapFocus={!isSuccess}
      onOpenChange={(e: any) => {
        if (!e.open) {
          onModalClose();
        }
      }}>
      <Portal>

        <SuccessOverlay startAnimation={!!transactionHash} />
        <Dialog.Positioner>
          <Dialog.Content {...getStylesForModalContentWithStepTracker(isDesktop)}>
            {showTransactionSteps && isDesktop && (
              <DesktopStepTracker chain={GqlChain.Mainnet} transactionSteps={transactionSteps} />
            )}
            {showTransactionSteps ? (
              <TransactionModalHeader
                chain={GqlChain.Mainnet}
                label="Sync veBAL"
                txHash={transactionHash}
              />
            ) : (
              <Dialog.Header>Sync veBAL: Select networks</Dialog.Header>
            )}
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <AnimateHeightChange gap="sm" w="full">
                {showTransactionSteps ? (
                  <>
                    {isMobile && (
                      <MobileStepTracker chain={GqlChain.Mainnet} transactionSteps={transactionSteps} />
                    )}
                  </>
                ) : (
                  <NetworksSelectionStep
                    networks={networks}
                    selectedNetworks={selectedNetworks}
                    toggleNetwork={toggleNetwork}
                  />
                )}
              </AnimateHeightChange>
            </Dialog.Body>
            {transactionSteps.currentStep && showTransactionSteps ? (
              <ActionModalFooter
                currentStep={transactionSteps.currentStep}
                isSuccess={isSuccess}
                returnAction={onClose}
                returnLabel="Return to vebal"
              />
            ) : (
              <Dialog.Footer>
                <Button
                  disabled={selectedNetworks.length === 0}
                  onClick={() => setShowTransactionSteps(true)}
                  size="lg"
                  w="full"
                >
                  Next
                </Button>
              </Dialog.Footer>
            )}
          </Dialog.Content>
        </Dialog.Positioner>

      </Portal>
    </Dialog.Root>
  );
}
