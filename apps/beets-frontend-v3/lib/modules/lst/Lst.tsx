/* eslint-disable max-len */
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
  Flex,
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
import { useGetStakedSonicData } from './hooks/useGetStakedSonicData'
import { bn, fNum, fNumCustom } from '@repo/lib/shared/utils/numbers'
import { ZenGarden } from '@repo/lib/shared/components/zen/ZenGarden'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { LstFaq } from './components/LstFaq'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { GetStakedSonicDataQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { LstStats } from './components/LstStats'
import networkConfigs from '@repo/lib/config/networks'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Address } from 'viem'
import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'

const CHAIN = GqlChain.Sonic

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

function LstForm() {
  const nextBtn = useRef(null)
  const stakeModalDisclosure = useDisclosure()
  const unstakeModalDisclosure = useDisclosure()
  const [disclosure, setDisclosure] = useState(stakeModalDisclosure)
  const isMounted = useIsMounted()
  const { isConnected } = useUserAccount()
  const { isBalancesLoading } = useTokenBalances()
  const { startTokenPricePolling } = useTokens()

  const {
    activeTab,
    setActiveTab,
    amountAssets,
    amountShares,
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
    nativeAsset,
    stakedAsset,
    getAmountShares,
    getAmountAssets,
    isRateLoading,
  } = useLst()

  const { userNumWithdraws, isLoading: isUserNumWithdrawsLoading } = useGetUserNumWithdraws(chain)

  const { data: UserWithdraws, isLoading: isWithdrawalsLoading } = useGetUserWithdraws(
    chain,
    userNumWithdraws
  )
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
    if (isStakeTab) {
      setDisclosure(stakeModalDisclosure)
      setAmountAssets('')
    } else if (isUnstakeTab) {
      setDisclosure(unstakeModalDisclosure)
      setAmountShares('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  useEffect(() => {
    setActiveTab(tabs[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    <VStack h="full" w="full">
      <CardBody align="start" as={VStack} h="full" w="full">
        <Box w="full" h="full">
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
        </Box>
        {/* <HStack>
          {isStakedSonicDataLoading ? (
            <Skeleton h="full" w="12" />
          ) : (
            <>
              <Text>{`1 ${tokenIn}`}</Text>
              <Icon as={ArrowRight} />
              <Text>{`${fNum('token', rate)} ${tokenOut}`}</Text>
            </>
          )}
        </HStack> */}
        {isStakeTab && !isRateLoading && amountAssets !== '' && (
          <LstYouWillReceive
            label="You will receive"
            amount={getAmountShares(amountAssets)}
            address={stakedAsset?.address || ''}
            symbol={stakedAsset?.symbol || ''}
          />
        )}
        {isUnstakeTab && !isRateLoading && amountShares !== '' && (
          <LstYouWillReceive
            label="You can withdraw (after 14 days)"
            amount={getAmountAssets(amountShares)}
            address={nativeAsset?.address || ''}
            symbol={nativeAsset?.symbol || ''}
          />
        )}
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
    </VStack>
  )
}

function LstYouWillReceive({
  label,
  amount,
  address,
  symbol,
}: {
  label: string
  amount: string
  address: string
  symbol: string
}) {
  const amountFormatted = fNumCustom(amount, '0,0.[000000]')

  return (
    <Box w="full">
      <FadeInOnView>
        <Flex w="full" alignItems="flex-end">
          <Box flex="1">
            <Text mb="sm" color="grayText">
              {label}
            </Text>
            <Text fontSize="3xl">
              {amountFormatted === 'NaN' ? amount : amountFormatted} {symbol}
            </Text>
          </Box>
          <Box>
            <TokenIcon address={address} alt={symbol} chain={CHAIN} size={40} />
          </Box>
        </Flex>
      </FadeInOnView>
    </Box>
  )
}

function LstStatRow({
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

function LstInfo({
  stakedSonicData,
  isStakedSonicDataLoading,
}: {
  stakedSonicData?: GetStakedSonicDataQuery
  isStakedSonicDataLoading: boolean
}) {
  const lstAddress = (networkConfigs[CHAIN].contracts.beets?.lstStakingProxy || '') as Address
  const { getToken, usdValueForToken } = useTokens()
  const lstToken = getToken(lstAddress, CHAIN)
  const { toCurrency } = useCurrency()
  const assetsToSharesRate = stakedSonicData?.stsGetGqlStakedSonicData.exchangeRate || '1.0'
  const sharesToAssetsRate = bn(1).div(bn(assetsToSharesRate))

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
        <LstStatRow
          isLoading={isStakedSonicDataLoading}
          label="Total ($S)"
          secondaryValue={toCurrency(
            usdValueForToken(lstToken, stakedSonicData?.stsGetGqlStakedSonicData.totalAssets || '0')
          )}
          value={fNum('token', stakedSonicData?.stsGetGqlStakedSonicData.totalAssets || '0')}
        />
        <LstStatRow
          isLoading={isStakedSonicDataLoading}
          label="Delegated ($S)"
          secondaryValue={toCurrency(
            usdValueForToken(
              lstToken,
              stakedSonicData?.stsGetGqlStakedSonicData.totalAssetsDelegated || '0'
            )
          )}
          value={fNum(
            'token',
            stakedSonicData?.stsGetGqlStakedSonicData.totalAssetsDelegated || '0'
          )}
        />
        <LstStatRow
          isLoading={isStakedSonicDataLoading}
          label="Pending delegation ($S)"
          secondaryValue={toCurrency(
            usdValueForToken(
              lstToken,
              stakedSonicData?.stsGetGqlStakedSonicData.totalAssetsPool || '0'
            )
          )}
          value={fNum('token', stakedSonicData?.stsGetGqlStakedSonicData.totalAssetsPool || '0')}
        />
        <LstStatRow
          isLoading={isStakedSonicDataLoading}
          label="stS rate"
          secondaryValue={`1 S = ${fNum('token', sharesToAssetsRate)} stS`}
          value={`1 stS = ${fNum('token', assetsToSharesRate)} S`}
        />
        <Box minH="120px" w="full" />
        {/* <Box minH="200px" w="full">
          <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />
        </Box> */}
      </VStack>
    </NoisyCard>
  )
}

export function Lst() {
  const { data: stakedSonicData, loading: isStakedSonicDataLoading } = useGetStakedSonicData()

  return (
    <FadeInOnView>
      <DefaultPageContainer noVerticalPadding>
        <VStack gap="xl" w="full">
          <LstStats />
          <Card rounded="xl" w="full">
            <Grid gap="lg" templateColumns={{ base: '1fr', lg: '5fr 4fr' }}>
              <GridItem>
                <LstForm />
              </GridItem>
              <GridItem>
                <LstInfo
                  isStakedSonicDataLoading={isStakedSonicDataLoading}
                  stakedSonicData={stakedSonicData}
                />
              </GridItem>
            </Grid>
          </Card>
          <LstFaq />
        </VStack>
      </DefaultPageContainer>
    </FadeInOnView>
  )
}
