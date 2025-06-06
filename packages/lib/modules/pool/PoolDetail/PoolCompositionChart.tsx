import { getCompositionTokens, getFlatCompositionTokens } from '../pool-tokens.utils'
import { usePool } from '../PoolProvider'
import { PoolWeightChart } from './PoolWeightCharts/PoolWeightChart'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import {
  GqlChain,
  GqlPoolLiquidityBootstrappingV3,
} from '@repo/lib/shared/services/api/generated/graphql'
import { Pool } from '../pool.types'
import { VStack, Skeleton, Box } from '@chakra-ui/react'
import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { useState } from 'react'
import { isLBP, isQuantAmmPool } from '../pool.helpers'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { PoolZenGarden } from '@repo/lib/shared/components/zen/ZenGarden'
import { PoolWeightShiftsChart } from './PoolWeightCharts/quantamm/PoolWeightShiftsChart'
import { WeightsChart } from '../../lbp/steps/sale-structure/WeightsChart'
import { secondsToMilliseconds } from 'date-fns'

const TABS_LIST: ButtonGroupOption[] = [
  { value: 'weight-shifts', label: 'Weight shifts' },
  { value: 'composition', label: 'Composition' },
]

interface CompositionViewProps {
  chain: GqlChain
  heightPx: number
  isMobile: boolean
  pool: Pool
  totalLiquidity: string
}

function CompositionView({
  isMobile,
  heightPx,
  chain,
  pool,
  totalLiquidity,
}: CompositionViewProps) {
  return (
    <>
      <PoolZenGarden
        poolType={pool.type}
        sizePx={isMobile ? '300px' : `${heightPx}px`}
        subdued={false} // Make it more visible
      />
      <PoolWeightChart
        chain={chain}
        displayTokens={getFlatCompositionTokens(pool)}
        hasLegend
        totalLiquidity={totalLiquidity}
      />
    </>
  )
}

export function PoolCompositionChart({ height, isMobile }: { height: number; isMobile: boolean }) {
  const { chain, isLoading, pool } = usePool()
  const { calcTotalUsdValue } = useTokens()

  const isQuantAmm = isQuantAmmPool(pool.type)
  const [activeTab, setActiveTab] = useState(TABS_LIST[isQuantAmm || isLBP(pool.type) ? 0 : 1])

  const compositionTokens = getCompositionTokens(pool)
  const totalLiquidity = calcTotalUsdValue(compositionTokens, chain)
  const heightPx = height - 35

  const compositionViewProps: CompositionViewProps = {
    chain,
    heightPx,
    isMobile,
    pool,
    totalLiquidity,
  }

  return (
    <NoisyCard
      cardProps={{
        height: [isQuantAmm ? '395px' : '300px', `${heightPx}px`],
        overflow: 'hidden',
        position: 'relative',
      }}
      contentProps={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}
    >
      {isLoading ? (
        <Skeleton h="full" w="full" />
      ) : isQuantAmm || isLBP(pool.type) ? (
        <VStack h="full" p={{ base: 'sm', md: 'md' }} spacing="md" w="full">
          <Box alignSelf="flex-start">
            <ButtonGroup
              currentOption={activeTab}
              groupId="composition-chart"
              onChange={tab => setActiveTab(tab)}
              options={TABS_LIST}
              size="xxs"
            />
          </Box>
          {activeTab.value === 'weight-shifts' && isQuantAmm ? (
            <PoolWeightShiftsChart />
          ) : activeTab.value === 'weight-shifts' && isLBP(pool.type) ? (
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

function LBPWeightsChart({ pool }: { pool: Pool }) {
  const lbpPool = pool as GqlPoolLiquidityBootstrappingV3
  const startTime = new Date(secondsToMilliseconds(lbpPool.startTime))
  const endTime = new Date(secondsToMilliseconds(lbpPool.endTime))
  const startWeight = lbpPool.projectTokenStartWeight * 100
  const endWeight = lbpPool.projectTokenEndWeight * 100
  const now = new Date()

  return (
    <WeightsChart
      startWeight={startWeight}
      endWeight={endWeight}
      startDate={startTime}
      endDate={endTime}
      cutTime={now}
    />
  )
}
