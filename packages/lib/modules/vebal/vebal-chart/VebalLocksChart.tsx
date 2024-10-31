import { Card, CardProps, Text, VStack } from '@chakra-ui/react'

import ReactECharts from 'echarts-for-react'
import { useVebalLocksChart, UseVebalLocksChartParams } from './useVebalLocksChart'
import { ChartBubbleIcon } from '@repo/lib/shared/components/icons/ChartBubbleIcon'

export function VebalLocksChart({
  mainnetLockedInfo,
  lockSnapshots,
  ...props
}: CardProps & UseVebalLocksChartParams) {
  const { options, onChartReady, onEvents, insufficientData } = useVebalLocksChart({
    mainnetLockedInfo,
    lockSnapshots,
  })

  return (
    <Card position="relative" {...props}>
      {insufficientData ? (
        <VStack h="full" justifyContent="center">
          <Text variant="secondary">
            <ChartBubbleIcon size={16} />
          </Text>
          <Text fontSize="lg" fontWeight={700} variant="secondary">
            Not enough data
          </Text>
        </VStack>
      ) : (
        <ReactECharts
          onChartReady={onChartReady}
          onEvents={onEvents}
          option={options}
          style={{ height: '100%', width: '100%' }}
        />
      )}
    </Card>
  )
}
