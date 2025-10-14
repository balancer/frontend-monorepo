'use client'

import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  Tooltip,
  useDisclosure,
  VStack,
  BoxProps,
  Grid,
  GridItem,
  Divider,
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
import { LoopsDepositModal } from './modals/LoopsDepositModal'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { LoopsDeposit } from './components/LoopsDeposit'
import { bn, fNum, fNumCustom } from '@repo/lib/shared/utils/numbers'
import { ZenGarden } from '@repo/lib/shared/components/zen/ZenGarden'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { LoopsFaq } from './components/LoopsFaq'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { LoopsStats } from './components/LoopsStats'
import { YouWillReceive } from '@/lib/components/shared/YouWillReceive'
import { StatRow } from '@/lib/components/shared/StatRow'
import { useLoopsGetData } from './hooks/useLoopsGetData'
import { GetLoopsDataQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { getNetworkConfig } from '@repo/lib/config/networks'
import { LoopsWithdraw } from './components/LoopsWithdraw'
import { LoopsWithdrawModal } from './modals/LoopsWithdrawModal'
import { useLoopsGetFlyQuote } from './hooks/useLoopsGetFlyQuote'
import { formatUnits } from 'viem'

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
    amountShares,
    wNativeAsset,
  } = useLoops()

  const { wethAmountOut, isLoading: isLoadingFlyQuote } = useLoopsGetFlyQuote(amountShares, chain)

  const isLoading = !isMounted || isBalancesLoading || isLoadingFlyQuote
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
          {isWithdrawTab && <LoopsWithdraw />}
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
        {isWithdrawTab && !isLoadingFlyQuote && wethAmountOut !== 0n && (
          <YouWillReceive
            address={wNativeAsset?.address || ''}
            amount={formatUnits(wethAmountOut, wNativeAsset?.decimals ?? 18)}
            chain={chain}
            label="You will receive"
            symbol={wNativeAsset?.symbol || ''}
          />
        )}
      </CardBody>
      <CardFooter w="full">
        {isConnected && (
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
      <LoopsDepositModal
        finalFocusRef={nextBtn}
        isOpen={depositModalDisclosure.isOpen}
        onClose={onModalClose}
      />
      <LoopsWithdrawModal
        finalFocusRef={nextBtn}
        isOpen={withdrawModalDisclosure.isOpen}
        onClose={onModalClose}
      />
    </VStack>
  )
}

function LoopsInfo({
  loopsData,
  isLoopsDataLoading,
}: {
  loopsData?: GetLoopsDataQuery
  isLoopsDataLoading: boolean
}) {
  const { toCurrency } = useCurrency()
  const { usdValueForTokenAddress } = useTokens()
  const { chain } = useLoops()

  const assetsToSharesRate = loopsData?.loopsGetData.rate || '1.0'
  const sharesToAssetsRate = bn(1).div(bn(assetsToSharesRate))

  const networkConfig = getNetworkConfig(chain)

  const collateralUsdValue = usdValueForTokenAddress(
    networkConfig.tokens.stakedAsset?.address || '',
    chain,
    loopsData?.loopsGetData.collateralAmountInEth || '0'
  )

  const debtUsdValue = usdValueForTokenAddress(
    networkConfig.tokens.nativeAsset.address,
    chain,
    loopsData?.loopsGetData.debtAmount || '0'
  )

  const customFormat = '0.[000]'

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
        <StatRow
          isLoading={isLoopsDataLoading}
          label="Total collateral"
          secondaryValue={`${fNum('token', bn(loopsData?.loopsGetData.collateralAmountInEth || '0'))} S`}
          tertiaryValue={toCurrency(collateralUsdValue)}
          value={`${fNum('token', bn(loopsData?.loopsGetData.collateralAmount || '0'))} stS`}
        />
        <StatRow
          isLoading={isLoopsDataLoading}
          label="Total debt"
          secondaryValue={toCurrency(debtUsdValue)}
          value={`${fNum('token', bn(loopsData?.loopsGetData.debtAmount || '0'))} S`}
        />
        <StatRow
          isLoading={isLoopsDataLoading}
          label="loopS rate"
          secondaryValue={`1 S = ${fNum('token', sharesToAssetsRate)} loopS`}
          value={`1 loopS = ${fNum('token', assetsToSharesRate)} S`}
        />
        <Divider my="md" />
        <StatRow
          isLoading={isLoopsDataLoading}
          label="Health factor"
          value={`${fNumCustom(bn(loopsData?.loopsGetData.healthFactor || '0'), customFormat)}`}
        />
        <StatRow
          isLoading={isLoopsDataLoading}
          label="Current leverage"
          value={`${fNumCustom(bn(loopsData?.loopsGetData.leverage || '0'), customFormat)}x`}
        />
        <StatRow
          isLoading={isLoopsDataLoading}
          label="Actual supply"
          value={fNum('token', bn(loopsData?.loopsGetData.actualSupply || '0'))}
        />
        <StatRow
          isLoading={isLoopsDataLoading}
          label="Sonic points multiplier"
          value={`${fNumCustom(bn(loopsData?.loopsGetData.sonicPointsMultiplier || '0'), customFormat)}x`}
        />
        <Box minH="20px" w="full" />
      </VStack>
    </NoisyCard>
  )
}

export function Loops() {
  const { data: loopsData, loading: isLoopsDataLoading } = useLoopsGetData()

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
                <LoopsInfo isLoopsDataLoading={isLoopsDataLoading} loopsData={loopsData} />
              </GridItem>
            </Grid>
          </Card>
          <LoopsFaq />
        </VStack>
      </DefaultPageContainer>
    </FadeInOnView>
  )
}
