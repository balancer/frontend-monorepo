'use client'

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  Card,
  Text,
  ModalFooter,
  Button,
  VStack,
  Checkbox,
  ModalHeader,
  HStack,
  Heading,
} from '@chakra-ui/react'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { useBreakpoints } from '@/lib/shared/hooks/useBreakpoints'
import { TransactionModalHeader } from '@/lib/shared/components/modals/TransactionModalHeader'
import { ActionModalFooter } from '@/lib/shared/components/modals/ActionModalFooter'
import { SuccessOverlay } from '@/lib/shared/components/modals/SuccessOverlay'
import { useState } from 'react'
import { AnimateHeightChange } from '@/lib/shared/components/animations/AnimateHeightChange'
import { useCrossChainSyncSteps } from '@/lib/modules/vebal/cross-chain/useCrossChainSyncSteps'
import { useTransactionSteps } from '../../transactions/transaction-steps/useTransactionSteps'
// eslint-disable-next-line max-len
import { getStylesForModalContentWithStepTracker } from '@/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { DesktopStepTracker } from '@/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { MobileStepTracker } from '@/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { uniq } from 'lodash'
import { getChainShortName } from '@/lib/config/app.config'

import { useVebalUserData } from '@/lib/modules/vebal/useVebalUserData'
import { useCrossChainSync } from './CrossChainSyncProvider'

type Props = {
  isOpen: boolean
  onClose(): void
  networks: GqlChain[]
}

function NetworksSelectionStep({ networks, selectedNetworks, toggleNetwork }: NetworkOptionsProps) {
  const { data } = useVebalUserData()
  const myVebalBalance = data?.veBalGetUser.balance

  return (
    <VStack gap="4">
      <Text variant="secondary">
        Layer 2 networks don’t know your veBAL balance from Ethereum, unless you sync it. Each
        network costs additional gas to sync, so it’s best to only sync networks where you plan to
        stake
      </Text>
      <Card gap="4">
        <Heading>
          <HStack w="full" justifyContent="space-between">
            <Text>Ethereum</Text>
            <Text> {Number(myVebalBalance).toFixed(4)} veBAL</Text>
          </HStack>
        </Heading>
        <NetworkOptions
          networks={networks}
          selectedNetworks={selectedNetworks}
          toggleNetwork={toggleNetwork}
        />
      </Card>
    </VStack>
  )
}

interface NetworkOptionsProps {
  networks: GqlChain[]
  selectedNetworks: GqlChain[]
  toggleNetwork: (checked: boolean, network: GqlChain) => void
}

function NetworkOptions({ networks, selectedNetworks, toggleNetwork }: NetworkOptionsProps) {
  const { l2VeBalBalances } = useCrossChainSync()
  return (
    <VStack align="start" w="full" spacing="xs">
      {networks.map(network => (
        <Checkbox
          key={`checkbox-${String(network)}`}
          isChecked={selectedNetworks.includes(network)}
          onChange={e => toggleNetwork(e.target.checked, network)}
        >
          <HStack w="full">
            <Text>{getChainShortName(network)}</Text>
            <Text>{l2VeBalBalances[network]} veBAL</Text>
          </HStack>
        </Checkbox>
      ))}
    </VStack>
  )
}

export function CrossChainSyncModal({ isOpen, onClose, networks }: Props) {
  const { refetch } = useCrossChainSync()
  const [selectedNetworks, setSelectedNetworks] = useState<GqlChain[]>([])
  const [showTransactionSteps, setShowTransactionSteps] = useState(false)
  const { isDesktop, isMobile } = useBreakpoints()

  const steps = useCrossChainSyncSteps({
    networks: selectedNetworks,
  })
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

  return (
    <Modal isOpen={isOpen} onClose={onModalClose} isCentered preserveScrollBarGap>
      <SuccessOverlay startAnimation={!!transactionHash} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
        {showTransactionSteps && isDesktop && (
          <DesktopStepTracker transactionSteps={transactionSteps} chain={GqlChain.Mainnet} />
        )}
        {showTransactionSteps ? (
          <TransactionModalHeader
            label="Sync veBAL"
            txHash={transactionHash}
            chain={GqlChain.Mainnet}
          />
        ) : (
          <ModalHeader>Sync veBAL: Select networks</ModalHeader>
        )}
        <ModalCloseButton />
        <ModalBody>
          <AnimateHeightChange spacing="sm" w="full">
            {showTransactionSteps ? (
              <>
                {isMobile && (
                  <MobileStepTracker transactionSteps={transactionSteps} chain={GqlChain.Mainnet} />
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
        </ModalBody>

        {showTransactionSteps ? (
          <ActionModalFooter
            isSuccess={!!transactionHash}
            currentStep={transactionSteps.currentStep}
            returnLabel="Return to vebal"
            returnAction={onClose}
          />
        ) : (
          <ModalFooter>
            <Button
              isDisabled={selectedNetworks.length === 0}
              onClick={() => setShowTransactionSteps(true)}
              w="full"
              size="lg"
            >
              Next
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  )
}
