import { getCompositionTokens, getFlatCompositionTokens } from '../pool-tokens.utils'
import { usePool } from '../PoolProvider'
import { PoolWeightChart } from './PoolWeightCharts/PoolWeightChart'
import { PoolWeightShiftsChart } from './PoolWeightCharts/PoolWeightShiftsChart'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { VStack, HStack, Skeleton } from '@chakra-ui/react'
import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { useState } from 'react'
import { isQuantAmmPool } from '../pool.helpers'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { PoolZenGarden } from '@repo/lib/shared/components/zen/ZenGarden'

const TABS_LIST: ButtonGroupOption[] = [
  { value: 'weight-shifts', label: 'Weight shifts' },
  { value: 'composition', label: 'Composition' },
]

export function PoolCompositionChart({ height, isMobile }: { height: number; isMobile: boolean }) {
  const { chain, isLoading, pool } = usePool()
  const { calcTotalUsdValue } = useTokens()

  const isQuantAmm = isQuantAmmPool(pool.type)
  const [activeTab, setActiveTab] = useState(TABS_LIST[isQuantAmm ? 0 : 1])

  const compositionTokens = getCompositionTokens(pool)
  const totalLiquidity = calcTotalUsdValue(compositionTokens, chain)
  const heightPx = height - 35

  return (
    <NoisyCard
      cardProps={{
        height: ['300px', `${heightPx}px`],
        overflow: 'hidden',
        position: 'relative',
      }}
      contentProps={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}
    >
      {isLoading ? (
        <Skeleton h="full" w="full" />
      ) : isQuantAmm ? (
        <VStack h="full" p={{ base: 'sm', md: 'md' }} spacing="md" w="full">
          <HStack alignSelf="flex-start">
            <ButtonGroup
              currentOption={activeTab}
              groupId="composition-chart"
              onChange={tab => setActiveTab(tab)}
              options={TABS_LIST}
              size="xxs"
            />
          </HStack>
          {activeTab.value === 'weight-shifts' ? (
            <PoolWeightShiftsChart />
          ) : (
            <>
              <PoolZenGarden sizePx={isMobile ? '300px' : `${heightPx}px`} />
              <PoolWeightChart
                chain={chain}
                displayTokens={getFlatCompositionTokens(pool)}
                hasLegend
                totalLiquidity={totalLiquidity}
              />
            </>
          )}
        </VStack>
      ) : (
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
      )}
    </NoisyCard>
  )
}
