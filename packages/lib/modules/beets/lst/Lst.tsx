/* eslint-disable max-len */
'use client'

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Heading,
  HStack,
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
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { LstStake } from './components/LstStake'
import { LstUnstake } from './components/LstUnstake'
import { LstUnstakeModal } from './modals/LstUnstakeModal'
import { LstWithdraw } from './components/LstWithdraw'
import { useGetUserWithdraws, UserWithdraw } from './hooks/useGetUserWithdraws'
import { useGetUserNumWithdraws } from './hooks/useGetUserNumWithdraws'

const FAQ_ITEMS = [
  {
    question: 'What is liquid staking?',
    answer:
      'Liquid staking lets you stake your tokens, earn rewards, and stay liquid. When you stake, you mint stS tokens which automatically rebase to  reflect network rewards.',
  },
  {
    question: 'How do I get stS tokens?',
    answer:
      'Stake your S tokens with the protocol to mint stS. It’s permissionless and seamless, running on public blockchains. You can interact with the smart contracts directly or get started easily through our main UI.',
  },
  {
    question: 'Where can I use stS tokens?',
    answer:
      'From yield farming to liquidity pools to lending markets, stS is your gateway to a growing DeFi ecosystem on Sonic.',
  },
]

export function Lst() {
  const { isConnected } = useUserAccount()
  const isMounted = useIsMounted()
  const nextBtn = useRef(null)
  const {
    activeTab,
    setActiveTab,
    setAmountAssets,
    setAmountShares,
    isDisabled,
    disabledReason,
    isStakeTab,
    isUnstakeTab,
    isWithdrawTab,
    stakeTransactionSteps,
    unstakeTransactionSteps,
    chain,
  } = useLst()
  const stakeModalDisclosure = useDisclosure()
  const unstakeModalDisclosure = useDisclosure()
  const { startTokenPricePolling } = useTokens()
  const { isBalancesLoading } = useTokenBalances()
  const [disclosure, setDisclosure] = useState(stakeModalDisclosure)
  const { userNumWithdraws, isLoading: isUserNumWithdrawsLoading } = useGetUserNumWithdraws(chain)
  const { data, isLoading: isWithdrawalsLoading } = useGetUserWithdraws(chain, userNumWithdraws)

  const isLoading =
    !isMounted || isBalancesLoading || isWithdrawalsLoading || isUserNumWithdrawsLoading
  const loadingText = isLoading ? 'Loading...' : undefined

  const tabs: ButtonGroupOption[] = [
    {
      value: '0',
      label: 'Stake',
      disabled: false,
    },
    {
      value: '1',
      label: 'Unstake',
      disabled: false,
    },
    {
      value: '2',
      label: 'Withdraw',
      disabled: false,
    },
  ]

  useEffect(() => {
    setActiveTab(tabs[0])
  }, [])

  useEffect(() => {
    if (isStakeTab) {
      setDisclosure(stakeModalDisclosure)
      setAmountAssets('')
    } else if (isUnstakeTab) {
      setDisclosure(unstakeModalDisclosure)
      setAmountShares('')
    }
  }, [activeTab])

  function onModalClose() {
    // restart polling for token prices when modal is closed again
    startTokenPricePolling()

    // just reset all transaction steps
    stakeTransactionSteps.resetTransactionSteps()
    unstakeTransactionSteps.resetTransactionSteps()

    // reset amounts
    setAmountAssets('')
    setAmountShares('')

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
        <VStack gap="xl" w="full">
          <Card rounded="xl" w="full">
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
              {isWithdrawTab && !isWithdrawalsLoading && (
                <LstWithdraw
                  isLoading={isWithdrawalsLoading || isUserNumWithdrawsLoading}
                  withdrawalsData={data as UserWithdraw[]}
                />
              )}
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
          <Card rounded="xl" w="full">
            <CardHeader as={HStack} justify="space-between" w="full">
              <Heading as="h2" size="lg">
                FAQ
              </Heading>
            </CardHeader>
            <CardBody align="start" as={VStack} />
            <Accordion allowToggle variant="button">
              {FAQ_ITEMS.map(item => (
                <AccordionItem key={item.question}>
                  <h2>
                    <AccordionButton>
                      <Box as="span" flex="1" textAlign="left">
                        {item.question}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb="md">{item.answer}</AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </VStack>
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