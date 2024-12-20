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
  Icon,
  BoxProps,
  Grid,
  GridItem,
  useTheme as useChakraTheme,
  ColorMode,
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
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { GetStakedSonicDataQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { getDefaultPoolChartOptions } from '../../pool/PoolDetail/PoolStats/PoolCharts/usePoolCharts'
import { useTheme as useNextTheme } from 'next-themes'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts/core'
import { LstStats } from './components/LstStats'

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

function LstForm({
  stakedSonicData,
  isStakedSonicDataLoading,
}: {
  stakedSonicData?: GetStakedSonicDataQuery
  isStakedSonicDataLoading: boolean
}) {
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
  const { userNumWithdraws, isLoading: isUserNumWithdrawsLoading } = useGetUserNumWithdraws(chain)
  const { data: UserWithdraws, isLoading: isWithdrawalsLoading } = useGetUserWithdraws(
    chain,
    userNumWithdraws
  )
  const isLoading =
    !isMounted || isBalancesLoading || isWithdrawalsLoading || isUserNumWithdrawsLoading
  const loadingText = isLoading ? 'Loading...' : undefined

  const tokenIn = useMemo(() => (isStakeTab ? 'S' : 'stS'), [isStakeTab])

  const tokenOut = useMemo(() => (isStakeTab ? 'stS' : 'S'), [isStakeTab])

  const rate = useMemo(() => {
    const rate = stakedSonicData?.stsGetGqlStakedSonicData.exchangeRate || '1'

    if (isStakeTab) {
      return bn(1).div(bn(rate))
    }

    return rate
  }, [isStakeTab, stakedSonicData])

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
    <HStack justify="space-between" align="flex-start" w="full">
      <Text color="font.secondary">{label}</Text>
      <Box display="flex" flexDirection="column" alignItems="flex-end">
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
  const { toCurrency } = useCurrency()
  const { theme: nextTheme } = useNextTheme()
  const theme = useChakraTheme()

  const defaultChartOptions = getDefaultPoolChartOptions(toCurrency, nextTheme as ColorMode, theme)

  const options = useMemo(() => {
    return {
      ...defaultChartOptions,
      series: [
        {
          type: 'line',
          data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
          },
          itemStyle: {
            color: 'red',
            borderRadius: 100,
          },
          emphasis: {
            itemStyle: {
              color: 'red',
              borderColor: 'red',
            },
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(14, 165, 233, 0.08)',
              },
              {
                offset: 1,
                color: 'rgba(68, 9, 236, 0)',
              },
            ]),
          },
          animationEasing: function (k: number) {
            return k === 1 ? 1 : 1 - Math.pow(2, -10 * k)
          },
        },
      ],
    }
  }, [defaultChartOptions])

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
          label="Total ($S)"
          value={'10,000,000'}
          secondaryValue={'$10,123,123.12'}
          isLoading={isStakedSonicDataLoading}
        />
        <LstStatRow
          label="Total staked ($S)"
          value={'1,000,000'}
          secondaryValue={'$1,000,000.00'}
          isLoading={isStakedSonicDataLoading}
        />
        <LstStatRow
          label="Total free"
          value={'123,123'}
          secondaryValue={'$123,123.12'}
          isLoading={isStakedSonicDataLoading}
        />
        <LstStatRow
          label="stS Rate"
          value={'1.0003 S'}
          secondaryValue={'1 S = 0.9997 stS'}
          isLoading={isStakedSonicDataLoading}
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
            <Grid gap="lg" templateColumns="5fr 4fr">
              <GridItem>
                <LstForm
                  isStakedSonicDataLoading={isStakedSonicDataLoading}
                  stakedSonicData={stakedSonicData}
                />
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
