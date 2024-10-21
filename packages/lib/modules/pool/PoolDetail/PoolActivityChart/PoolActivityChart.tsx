/* eslint-disable max-len */
'use client'
import ReactECharts from 'echarts-for-react'
import { Box, Divider, HStack, Skeleton, Text, useTheme } from '@chakra-ui/react'
import { usePoolActivityChart } from './usePoolActivityChart'
import { FC, PropsWithChildren } from 'react'
import { motion, easeOut } from 'framer-motion'
import { usePoolActivity } from '../PoolActivity/usePoolActivity'

const AnimateOpacity: FC<PropsWithChildren<object>> = ({ children }) => (
  <motion.div
    animate={{ opacity: 1 }}
    initial={{ opacity: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    {children}
  </motion.div>
)

export function PoolActivityChart() {
  const { isExpanded, isLoading } = usePoolActivity()
  const { chartOption, eChartsRef, chartHeight } = usePoolActivityChart()
  const theme = useTheme()

  const legendTabs = [
    {
      label: 'Adds',
      color: theme.semanticTokens.colors.chart.pool.scatter.add.label,
    },
    {
      label: 'Removes',
      color: theme.semanticTokens.colors.chart.pool.scatter.remove.label,
    },
    {
      label: 'Swaps',
      color: theme.semanticTokens.colors.chart.pool.scatter.swap.label,
    },
  ]

  return (
    <Box position="relative">
      {isLoading && <Skeleton h="100%" position="absolute" w="100%" />}
      {chartOption && (
        <Box>
          <motion.div
            animate={{ height: chartHeight, opacity: isExpanded ? [0, 1] : 1 }}
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
      {isExpanded && (
        <AnimateOpacity>
          <Divider mb="4" pt="2" />
        </AnimateOpacity>
      )}
      {!isLoading && isExpanded && (
        <AnimateOpacity>
          <HStack px={['1', '2']} spacing="4">
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
