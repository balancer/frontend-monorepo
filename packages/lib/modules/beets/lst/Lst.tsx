/* eslint-disable max-len */
'use client'

import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Heading,
  HStack,
  IconButton,
  Link,
  Stack,
  Tooltip,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { useEffect, useRef, useState } from 'react'
import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { useLst } from './LstProvider'
import { LstStakeModal } from './modals/LstStakeModal'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { LstStake } from './components/LstStake'
import { LstUnstake } from './components/LstUnstake'
import { LstUnstakeModal } from './modals/LstUnstakeModal'
import { LstWithdraw } from './components/LstWithdraw'

export function Lst() {
  const { isConnected } = useUserAccount()
  const isMounted = useIsMounted()
  const nextBtn = useRef(null)
  const {
    activeTab,
    setActiveTab,
    setAmount,
    isDisabled,
    disabledReason,
    isStakeTab,
    isUnstakeTab,
    isWithdrawTab,
    stakeTransactionSteps,
    unstakeTransactionSteps,
    stakedAsset,
  } = useLst()
  const stakeModalDisclosure = useDisclosure()
  const unstakeModalDisclosure = useDisclosure()
  const { startTokenPricePolling } = useTokens()
  const { isBalancesLoading, balanceFor } = useTokenBalances()
  const [disclosure, setDisclosure] = useState(stakeModalDisclosure)

  const isLoading = !isMounted || isBalancesLoading
  const loadingText = isLoading ? 'Loading...' : undefined

  const isUnstakeDisabled = bn(balanceFor(stakedAsset?.address || '')?.amount || 0).lte(0)

  const tabs: ButtonGroupOption[] = [
    {
      value: '0',
      label: 'Stake',
      disabled: false,
    },
    {
      value: '1',
      label: 'Unstake',
      disabled: isUnstakeDisabled,
    },
    {
      value: '2',
      label: 'Withdraw',
      disabled: false, // TODO: disable when no tokens unstaked
    },
  ]

  useEffect(() => {
    setActiveTab(tabs[0])
  }, [])

  useEffect(() => {
    if (isStakeTab) {
      setDisclosure(stakeModalDisclosure)
    } else if (isUnstakeTab) {
      setDisclosure(unstakeModalDisclosure)
    }
    setAmount('')
  }, [activeTab])

  function onModalClose() {
    // restart polling for token prices when modal is closed again
    startTokenPricePolling()

    // just reset all transaction steps
    stakeTransactionSteps.resetTransactionSteps()
    unstakeTransactionSteps.resetTransactionSteps()

    // reset amounts
    setAmount('')

    // finally close the modal
    disclosure.onClose()
  }

  return (
    <FadeInOnView>
      <Center
        h="full"
        left={['-12px', '0']}
        maxW="lg"
        mx="auto"
        position="relative"
        w={['100vw', 'full']}
      >
        <Card minH="590px" rounded="xl">
          <CardHeader as={HStack} justify="space-between" w="full">
            <Heading as="h2" size="lg">
              Liquid staking
            </Heading>
          </CardHeader>
          <CardBody align="start" as={VStack}>
            <VStack spacing="md" w="full">
              <ButtonGroup
                currentOption={activeTab}
                groupId="add-liquidity"
                hasLargeTextLabel
                isFullWidth
                onChange={setActiveTab}
                options={tabs}
                size="md"
              />
            </VStack>
            {isStakeTab && <LstStake />}
            {isUnstakeTab && <LstUnstake />}
            {isWithdrawTab && <LstWithdraw />}
          </CardBody>
          <CardFooter>
            {isConnected && !isWithdrawTab && (
              <Tooltip label={isDisabled ? disabledReason : ''}>
                <Button
                  isDisabled={isDisabled}
                  isLoading={isLoading}
                  loadingText={loadingText}
                  onClick={() => disclosure.onOpen()}
                  ref={nextBtn}
                  size="lg"
                  variant="secondary"
                  w="full"
                >
                  Next
                </Button>
              </Tooltip>
            )}
            {!isConnected && (
              <ConnectWallet
                isLoading={isLoading}
                loadingText={loadingText}
                size="lg"
                variant="primary"
                w="full"
              />
            )}
          </CardFooter>
        </Card>
      </Center>
      <LstStakeModal
        finalFocusRef={nextBtn}
        isOpen={stakeModalDisclosure.isOpen}
        onClose={onModalClose}
        onOpen={stakeModalDisclosure.onOpen}
      />
      <LstUnstakeModal
        finalFocusRef={nextBtn}
        isOpen={unstakeModalDisclosure.isOpen}
        onClose={onModalClose}
        onOpen={unstakeModalDisclosure.onOpen}
      />
    </FadeInOnView>
  )
}
