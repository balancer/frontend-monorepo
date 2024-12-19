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
  Tooltip,
  useDisclosure,
  VStack,
  Text,
  Skeleton,
  Icon,
  BoxProps,
} from '@chakra-ui/react'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { useEffect, useMemo, useRef, useState } from 'react'
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
import { useGetStakedSonicData } from './hooks/useGetStakedSonicData'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { ZenGarden } from '@repo/lib/shared/components/zen/ZenGarden'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { ArrowRight } from 'react-feather'
import { LstFaq } from './components/LstFaq'

const COMMON_NOISY_CARD_PROPS: { contentProps: BoxProps; cardProps: BoxProps } = {
  contentProps: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 'none',
    borderTopLeftRadius: 'none',
    borderBottomRightRadius: 'none',
  },
  cardProps: {
    position: 'relative',
    height: 'full',
  },
}

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
  const { data: UserWithdraws, isLoading: isWithdrawalsLoading } = useGetUserWithdraws(
    chain,
    userNumWithdraws
  )
  const { data: stakedSonicData, loading: isStakedSonicDataLoading } = useGetStakedSonicData()

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

  const tokenIn = useMemo(() => (isStakeTab ? 'S' : 'stS'), [isStakeTab])

  const tokenOut = useMemo(() => (isStakeTab ? 'stS' : 'S'), [isStakeTab])

  const rate = useMemo(() => {
    const rate = stakedSonicData?.stsGetGqlStakedSonicData.exchangeRate || '1'

    if (isStakeTab) {
      return bn(1).div(bn(rate))
    }

    return rate
  }, [isStakeTab, stakedSonicData])

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
                  withdrawalsData={UserWithdraws as UserWithdraw[]}
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
          {!isWithdrawTab && (
            <Card position="relative">
              <NoisyCard
                cardProps={COMMON_NOISY_CARD_PROPS.cardProps}
                contentProps={COMMON_NOISY_CARD_PROPS.contentProps}
              >
                <Box bottom={0} left={0} overflow="hidden" position="absolute" right={0} top={0}>
                  <ZenGarden sizePx="280px" subdued variant="circle" />
                </Box>
                <VStack
                  align="flex-start"
                  h="full"
                  justify="flex-start"
                  m="auto"
                  p={{ base: 'sm', md: 'md' }}
                  role="group"
                  spacing="xl"
                  w="full"
                  zIndex={1}
                >
                  <HStack justify="space-between" w="full">
                    <Text>APR:</Text>
                    {isStakedSonicDataLoading ? (
                      <Skeleton h="full" w="12" />
                    ) : (
                      <Text>
                        {fNum('apr', stakedSonicData?.stsGetGqlStakedSonicData.stakingApr || '0')}
                      </Text>
                    )}
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text>Rate:</Text>
                    <HStack>
                      {isStakedSonicDataLoading ? (
                        <Skeleton h="full" w="12" />
                      ) : (
                        <>
                          <Text>{`1 ${tokenIn}`}</Text>
                          <Icon as={ArrowRight} />
                          <Text>{`${fNum('token', rate)} ${tokenOut}`}</Text>
                        </>
                      )}
                    </HStack>
                  </HStack>
                </VStack>
              </NoisyCard>
            </Card>
          )}
          <LstFaq />
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
