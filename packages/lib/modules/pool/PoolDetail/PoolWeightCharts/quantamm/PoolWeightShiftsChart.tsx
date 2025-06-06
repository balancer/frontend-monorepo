'use client'

import ReactECharts from 'echarts-for-react'
import { usePoolWeightShiftsChart } from './usePoolWeightShiftsChart'
import { Flex, Text } from '@chakra-ui/react'
import { isEmpty } from 'lodash'

export function PoolWeightShiftsChart() {
  const { option } = usePoolWeightShiftsChart()

  return isEmpty(option) ? (
    <Flex align="center" h="full" justify="center" w="full">
      <Text fontSize="2xl" p="lg" variant="secondary">
        Not enough data
      </Text>
    </Flex>
  ) : (
    <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
  )
}
