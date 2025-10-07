'use client'

import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  HStack,
  Tooltip,
  useDisclosure,
  VStack,
  Text,
  Skeleton,
  BoxProps,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { useEffect, useRef, useState } from 'react'
import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { useLoops } from './LoopsProvider'
import { LoopDepositModal } from './modals/LoopDepositModal'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { LoopsDeposit } from './components/LoopsDeposit'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { ZenGarden } from '@repo/lib/shared/components/zen/ZenGarden'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { LstFaq } from './components/LoopsFaq'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { LoopsStats } from './components/LoopsStats'
import { YouWillReceive } from '@/lib/components/shared/YouWillReceive'
//import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

//const CHAIN = GqlChain.Sonic

const COMMON_NOISY_CARD_PROPS: { contentProps: BoxProps; cardProps: BoxProps } = {
  contentProps: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 'none',
    borderTopLeftRadius: 'none',
    borderBottomRightRadius: 'none',
    rounded: 'lg',
    overflow: 'hidden',
  },
  cardProps: {
    position: 'relative',
    height: 'full',
    rounded: 'lg',
    overflow: 'hidden',
  },
}

function LoopsForm() {
  const nextBtn = useRef(null)
  const depositModalDisclosure = useDisclosure()
  const withdrawModalDisclosure = useDisclosure()
  const [disclosure, setDisclosure] = useState(depositModalDisclosure)
  const isMounted = useIsMounted()
  const { isConnected } = useUserAccount()
  const { isBalancesLoading } = useTokenBalances()
  const { startTokenPricePolling } = useTokens()

  const {
    isDepositTab,
    isWithdrawTab,
    setAmountAssets,
    setAmountShares,
    activeTab,
    setActiveTab,
    depositTransactionSteps,
    withdrawTransactionSteps,
    isDisabled,
    disabledReason,
    loopedAsset,
    chain,
    amountAssets,
    getAmountShares,
    isRateLoading,
  } = useLoops()

  const isLoading = !isMounted || isBalancesLoading

  const loadingText = isLoading ? 'Loading...' : undefined

  const tabs: ButtonGroupOption[] = [
    {
      value: '0',
      label: 'Deposit',
      disabled: false,
    },
    {
      value: '1',
      label: 'Withdraw',
      disabled: false,
    },
  ]

  useEffect(() => {
    if (isDepositTab) {
      setDisclosure(depositModalDisclosure)
      setAmountAssets('')
    } else if (isWithdrawTab) {
      setDisclosure(withdrawModalDisclosure)
      setAmountShares('')
    }
  }, [activeTab])

  useEffect(() => {
    setActiveTab(tabs[0])
  }, [])

  function onModalClose() {
    // restart polling for token prices when modal is closed again
    startTokenPricePolling()

    // just reset all transaction steps
    depositTransactionSteps.resetTransactionSteps()
    withdrawTransactionSteps.resetTransactionSteps()

    // reset amounts
    setAmountAssets('')
    setAmountShares('')

    // finally close the modal
    disclosure.onClose()
  }

  return (
    <VStack h="full" w="full">
      <CardBody align="start" as={VStack} h="full" w="full">
        <Box h="full" w="full">
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
          {isDepositTab && <LoopsDeposit />}
          {/* {isWithdrawTab && <LoopsWithdraw />} */}
        </Box>
        {isDepositTab && !isRateLoading && amountAssets !== '' && (
          <YouWillReceive
            address={loopedAsset?.address || ''}
            amount={getAmountShares(amountAssets)}
            chain={chain}
            label="You will receive"
            symbol={loopedAsset?.symbol || ''}
          />
        )}
        {/*
        {isUnstakeTab && !isRateLoading && amountShares !== '' && (
          <LstYouWillReceive
            address={nativeAsset?.address || ''}
            amount={getAmountAssets(amountShares)}
            label="You can withdraw (after 14 days)"
            symbol={nativeAsset?.symbol || ''}
          />
        )} */}
      </CardBody>
      <CardFooter w="full">
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
      <LoopDepositModal
        finalFocusRef={nextBtn}
        isOpen={depositModalDisclosure.isOpen}
        onClose={onModalClose}
        onOpen={depositModalDisclosure.onOpen}
      />
      {/* <LstUnstakeModal
        finalFocusRef={nextBtn}
        isOpen={withdrawModalDisclosure.isOpen}
        onClose={onModalClose}
        onOpen={withdrawModalDisclosure.onOpen}
      /> */}
    </VStack>
  )
}

function LoopsStatRow({
  label,
  value,
  secondaryValue,
  isLoading,
}: {
  label: string
  value: string
  secondaryValue?: string
  isLoading?: boolean
}) {
  return (
    <HStack align="flex-start" justify="space-between" w="full">
      <Text color="font.secondary">{label}</Text>
      <Box alignItems="flex-end" display="flex" flexDirection="column">
        {isLoading ? <Skeleton h="full" w="12" /> : <Text fontWeight="bold">{value}</Text>}
        {isLoading ? (
          <Skeleton h="full" w="12" />
        ) : (
          <Text color="grayText" fontSize="sm">
            {secondaryValue}
          </Text>
        )}
      </Box>
    </HStack>
  )
}

function LoopsInfo() {
  const { toCurrency } = useCurrency()

  return (
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
        p={{ base: 'md', md: 'lg' }}
        role="group"
        spacing="sm"
        w="full"
        zIndex={1}
      >
        <LoopsStatRow
          isLoading={false}
          label="Total ($S)"
          secondaryValue={toCurrency('0')}
          value={fNum('token', '0')}
        />

        <Box minH="120px" w="full" />
      </VStack>
    </NoisyCard>
  )
}

export function Loops() {
  return (
    <FadeInOnView>
      <DefaultPageContainer noVerticalPadding>
        <VStack gap="xl" w="full">
          <LoopsStats />
          <Card rounded="xl" w="full">
            <Grid gap="lg" templateColumns={{ base: '1fr', lg: '5fr 4fr' }}>
              <GridItem>
                <LoopsForm />
              </GridItem>
              <GridItem>
                <LoopsInfo />
              </GridItem>
            </Grid>
          </Card>
          <LstFaq />
        </VStack>
      </DefaultPageContainer>
    </FadeInOnView>
  )
}
