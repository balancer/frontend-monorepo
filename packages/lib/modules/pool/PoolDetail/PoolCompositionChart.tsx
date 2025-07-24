import { getCompositionTokens, getFlatCompositionTokens } from '../pool-tokens.utils'
import { usePool } from '../PoolProvider'
import { PoolWeightChart } from './PoolWeightCharts/PoolWeightChart'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import {
  GqlChain,
  GqlPoolLiquidityBootstrappingV3,
} from '@repo/lib/shared/services/api/generated/graphql'
import { Pool } from '../pool.types'
import {
  VStack,
  Skeleton,
  Box,
  Divider,
  HStack,
  Text,
  Flex,
  useColorMode,
  Link,
} from '@chakra-ui/react'

import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { useState } from 'react'
import { isQuantAmmPool, isV3LBP } from '../pool.helpers'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { PoolWeightShiftsChart } from './PoolWeightCharts/quantamm/PoolWeightShiftsChart'
import { differenceInDays, differenceInHours, secondsToMilliseconds } from 'date-fns'
import { isSaleOngoing } from '../../lbp/pool/lbp.helpers'
import { RadialPattern } from '@repo/lib/shared/components/zen/RadialPattern'
import NextLink from 'next/link'
import { getSelectStyles } from '@repo/lib/shared/services/chakra/custom/chakra-react-select'
import { GroupBase, OptionBase, Select, chakraComponents } from 'chakra-react-select'
import { ArrowUpRight } from 'react-feather'
import { WeightsChartContainer } from '@repo/lib/modules/lbp/steps/sale-structure/WeightsChartContainer'

const TABS_LIST: ButtonGroupOption[] = [
  { value: 'weight-shifts', label: 'Weight shifts' },
  { value: 'composition', label: 'Composition' },
]

type BTFTimeOption = {
  value: string
  label: string
} & OptionBase

const BTF_TIME_OPTIONS: BTFTimeOption[] = [{ value: '7d', label: '7 days' }]

function BTFTimeSelector({ pool, chain }: { pool: Pool; chain: GqlChain }) {
  const chakraStyles = getSelectStyles<BTFTimeOption>()
  const baseUrl = 'https://quantamm.fi'
  const learnMoreUrl = pool && chain ? `${baseUrl}/factsheet/${pool.id}` : baseUrl

  const customChakraStyles: typeof chakraStyles = {
    ...chakraStyles,
    option: (provided, state) => ({
      ...chakraStyles.option?.(provided, state),
      ...(state.isSelected && {
        color: 'font.highlight',
      }),
    }),
    menu: (provided, state) => ({
      ...chakraStyles.menu?.(provided, state),
      w: '160px',
    }),
    menuList: (provided, state) => ({
      ...chakraStyles.menuList?.(provided, state),
      padding: 0,
      mt: '2',
    }),
  }

  const customComponents = {
    MenuList: ({ children, ...props }: any) => {
      return (
        <chakraComponents.MenuList {...props}>
          {children}
          <Divider borderColor="border.base" my={2} />
          <Box pb={2} px={2}>
            <Text color="font.secondary" fontSize="sm" lineHeight="1.4">
              View weight shifts over longer periods on{' '}
              <Link
                _hover={{ textDecoration: 'none' }}
                alignItems="center"
                as={NextLink}
                color="font.link"
                display="flex"
                fontSize="sm"
                href={learnMoreUrl}
                rel="noopener noreferrer"
                target="_blank"
                textDecoration="underline"
              >
                QuantAMM
                <ArrowUpRight size={12} />
              </Link>
            </Text>
          </Box>
        </chakraComponents.MenuList>
      )
    },
  }

  return (
    <Box maxW="max-content">
      <Select<BTFTimeOption, false, GroupBase<BTFTimeOption>>
        chakraStyles={customChakraStyles}
        components={customComponents}
        menuPortalTarget={document.body}
        name="BTFTimeSelector"
        // onChange={handleChange} // No other options for now
        options={BTF_TIME_OPTIONS}
        size="sm"
        styles={{
          menuPortal: base => ({ ...base, zIndex: 9999 }),
        }}
        value={BTF_TIME_OPTIONS[0]}
      />
    </Box>
  )
}

interface CompositionViewProps {
  chain: GqlChain
  heightPx: number
  isMobile: boolean
  pool: Pool
  totalLiquidity: string
  hasTabs: boolean
}

function CompositionView({ chain, pool, totalLiquidity, hasTabs }: CompositionViewProps) {
  const { colorMode } = useColorMode()
  return (
    <>
      <RadialPattern
        circleCount={8}
        height={890}
        innerHeight={240}
        innerWidth={240}
        left="calc(50% - 445px)"
        opacity={colorMode === 'dark' ? 0.35 : 0.45}
        pointerEvents="none"
        position="absolute"
        top={hasTabs ? 'calc(50% - 440px)' : 'calc(50% - 465px)'}
        width={890}
        zIndex={0}
      />

      <Flex h="full">
        <PoolWeightChart
          chain={chain}
          displayTokens={getFlatCompositionTokens(pool)}
          hasLegend
          totalLiquidity={totalLiquidity}
        />
      </Flex>
    </>
  )
}

export function PoolCompositionChart({ height, isMobile }: { height: number; isMobile: boolean }) {
  const { chain, isLoading, pool } = usePool()
  const { calcTotalUsdValue } = useTokens()

  const isQuantAmm = isQuantAmmPool(pool.type)
  const [activeTab, setActiveTab] = useState(TABS_LIST[isQuantAmm || isV3LBP(pool) ? 0 : 1])

  const compositionTokens = getCompositionTokens(pool)
  const totalLiquidity = calcTotalUsdValue(compositionTokens, chain)
  const heightPx = height - 35
  const hasTabs = isQuantAmm || isV3LBP(pool)

  const compositionViewProps: CompositionViewProps = {
    chain,
    heightPx,
    isMobile,
    pool,
    totalLiquidity,
    hasTabs,
  }

  return (
    <NoisyCard
      cardProps={{
        height: [hasTabs ? '395px' : '300px', `${heightPx}px`],
        overflow: 'hidden',
        position: 'relative',
      }}
      contentProps={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}
    >
      {isLoading ? (
        <Skeleton h="full" w="full" />
      ) : hasTabs ? (
        <VStack h="full" p={{ base: 'sm', md: 'md' }} spacing="md" w="full">
          <HStack alignSelf="flex-start" gap="ms" w="full">
            <ButtonGroup
              currentOption={activeTab}
              groupId="composition-chart"
              onChange={tab => setActiveTab(tab)}
              options={TABS_LIST}
              size="xxs"
            />
            {isQuantAmm && activeTab.value === 'weight-shifts' && (
              <BTFTimeSelector chain={chain} pool={pool} />
            )}
          </HStack>
          {activeTab.value === 'weight-shifts' && isQuantAmm ? (
            <PoolWeightShiftsChart />
          ) : activeTab.value === 'weight-shifts' && isV3LBP(pool) ? (
            <LBPWeightsChart pool={pool} />
          ) : (
            <CompositionView {...compositionViewProps} />
          )}
        </VStack>
      ) : (
        <CompositionView {...compositionViewProps} />
      )}
    </NoisyCard>
  )
}

// FIXME: [JUANJO] we can maybe merge this one with the one on the pool creation page
function LBPWeightsChart({ pool }: { pool: Pool }) {
  const lbpPool = pool as GqlPoolLiquidityBootstrappingV3
  const startTime = new Date(secondsToMilliseconds(lbpPool.startTime))
  const endTime = new Date(secondsToMilliseconds(lbpPool.endTime))
  const startWeight = lbpPool.projectTokenStartWeight * 100
  const endWeight = lbpPool.projectTokenEndWeight * 100
  const now = new Date()
  const daysDiff = differenceInDays(endTime, isSaleOngoing(lbpPool) ? now : startTime)

  const hoursDiff =
    differenceInHours(endTime, isSaleOngoing(lbpPool) ? now : startTime) - daysDiff * 24

  const salePeriodText = isSaleOngoing(lbpPool)
    ? `Sale: ${daysDiff ? `${daysDiff} days` : ''} ${hoursDiff ? `${hoursDiff} hours` : ''} remaining`
    : `Sale period: ${daysDiff ? `${daysDiff} days` : ''} ${hoursDiff ? `${hoursDiff} hours` : ''}`

  return (
    <WeightsChartContainer
      collateralTokenSymbol={lbpPool.poolTokens[lbpPool.reserveTokenIndex].symbol}
      cutTime={now}
      endDate={endTime.toISOString()}
      endWeight={endWeight}
      launchTokenSymbol={lbpPool.poolTokens[lbpPool.projectTokenIndex].symbol}
      salePeriodText={salePeriodText}
      startDate={startTime.toISOString()}
      startWeight={startWeight}
    />
  )
}
