import ReactECharts from 'echarts-for-react'
import { Box, HStack, Skeleton, Text, Separator, useChakraContext } from '@chakra-ui/react'
import { resolveChakraToken } from '@repo/lib/shared/services/chakra/theme-helpers'
import { usePoolActivityChart } from './usePoolActivityChart'
import { PropsWithChildren } from 'react'
import { motion, easeOut } from 'framer-motion'
import { usePoolActivity } from '../PoolActivity/usePoolActivity'

function AnimateOpacity({ children }: PropsWithChildren) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

export function PoolActivityChart() {
  const { isExpanded, isLoading } = usePoolActivity()
  const { chartOption, eChartsRef, chartHeight } = usePoolActivityChart()
  const system = useChakraContext()

  const legendTabs = [
    {
      label: 'Adds',
      color: resolveChakraToken(system, 'colors', 'chart.pool.scatter.add.label'),
    },
    {
      label: 'Removes',
      color: resolveChakraToken(system, 'colors', 'chart.pool.scatter.remove.label'),
    },
    {
      label: 'Swaps',
      color: resolveChakraToken(system, 'colors', 'chart.pool.scatter.swap.label'),
    },
  ]

  return (
    <Box position="relative">
      {isLoading && <Skeleton h="100%" position="absolute" w="100%" />}
      {chartOption && (
        <Box>
          <motion.div
            animate={{ height: chartHeight, opacity: [0, 1] }}
            initial={{ height: 90 }}
            transition={{ duration: 0.2, ease: easeOut }}
          >
            <ReactECharts
              onEvents={{}}
              option={chartOption}
              ref={eChartsRef}
              style={{ height: `${chartHeight}px` }}
            />
          </motion.div>
        </Box>
      )}
      {!isLoading && isExpanded && (
        <AnimateOpacity>
          <Separator mb="4" pt="2" />
          <HStack gap="4" px={['1', '2']}>
            {legendTabs.map((tab, index) => (
              <HStack alignItems="center" gap="2" key={index}>
                <Box
                  backgroundImage={tab.color}
                  borderRadius="50%"
                  display="inline-block"
                  height="2"
                  width="2"
                />
                <Text color="font.secondary" fontSize="sm">
                  {tab.label}
                </Text>
              </HStack>
            ))}
          </HStack>
        </AnimateOpacity>
      )}
    </Box>
  )
}
