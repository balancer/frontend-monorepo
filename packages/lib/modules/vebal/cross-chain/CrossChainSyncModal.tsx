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
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { ActionModalFooter } from '@repo/lib/shared/components/modals/ActionModalFooter'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useState } from 'react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useCrossChainSyncSteps } from '@repo/lib/modules/vebal/cross-chain/useCrossChainSyncSteps'
import { useTransactionSteps } from '../../transactions/transaction-steps/useTransactionSteps'
// eslint-disable-next-line max-len
import { getStylesForModalContentWithStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/step-tracker.utils'
import { DesktopStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/DesktopStepTracker'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { uniq } from 'lodash'
import { getChainShortName } from '@repo/lib/config/app.config'

import { useVebalUserData } from '@repo/lib/modules/vebal/useVebalUserData'
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
          <HStack justifyContent="space-between" w="full">
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
    <VStack align="start" spacing="xs" w="full">
      {networks.map(network => (
        <Checkbox
          isChecked={selectedNetworks.includes(network)}
          key={`checkbox-${String(network)}`}
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

  const isSuccess = !!transactionHash

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onModalClose}
      preserveScrollBarGap
      trapFocus={!isSuccess}
    >
      <SuccessOverlay startAnimation={!!transactionHash} />

      <ModalContent {...getStylesForModalContentWithStepTracker(isDesktop)}>
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
          <ModalHeader>Sync veBAL: Select networks</ModalHeader>
        )}
        <ModalCloseButton />
        <ModalBody>
          <AnimateHeightChange spacing="sm" w="full">
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
        </ModalBody>

        {showTransactionSteps ? (
          <ActionModalFooter
            currentStep={transactionSteps.currentStep}
            isSuccess={isSuccess}
            returnAction={onClose}
            returnLabel="Return to vebal"
          />
        ) : (
          <ModalFooter>
            <Button
              isDisabled={selectedNetworks.length === 0}
              onClick={() => setShowTransactionSteps(true)}
              size="lg"
              w="full"
            >
              Next
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  )
}
