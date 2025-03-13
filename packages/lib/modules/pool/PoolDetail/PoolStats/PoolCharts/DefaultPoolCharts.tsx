'use client'
import { Box } from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { usePoolCharts } from './usePoolCharts'
import { AnimatePresence, motion } from 'framer-motion'
import { usePoolChartTabs } from './PoolChartTabsProvider'

export function DefaultPoolCharts() {
  const { options, handleAxisMoved } = usePoolCharts()
  const { activeTab } = usePoolChartTabs()

  return (
    <Box h="full" overflow="hidden" position="relative" w="full">
      <AnimatePresence mode="wait">
        <motion.div
          animate={{ x: '0%' }}
          exit={{ x: '-100%' }}
          initial={{ x: '100%' }}
          key={activeTab.value}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <ReactECharts
            onEvents={{ updateAxisPointer: handleAxisMoved }}
            option={options}
            style={{ height: '100%', width: '100%' }}
          />
        </motion.div>
      </AnimatePresence>
    </Box>
  )
}
