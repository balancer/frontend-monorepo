import { Box, HStack, Card, VStack } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { EChartsOption } from 'echarts'
import { format, fromUnixTime } from 'date-fns'
import { useReliquary } from '../../ReliquaryProvider'
import { InfoButton } from '~/components/info-button/InfoButton'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'

export default function RelicMaturity() {
  const { maturityThresholds, isLoading, selectedRelic } = useReliquary()
  const { pool } = usePool()

  const levels = pool.staking?.reliquary?.levels
  const poolDataBefore = levels?.map((level, index) =>
    selectedRelic && index > selectedRelic.level ? '' : level.allocationPoints
  )
  const poolDataAfter = levels?.map((level, index) =>
    selectedRelic && index < selectedRelic.level ? '' : level.allocationPoints
  )

  const chartOption: EChartsOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
        },
        // any -> https://github.com/apache/echarts/issues/14277
        formatter: (params: any) => {
          return `Level ${params[0].dataIndex + 1}<br>Maturity date: ${params[0].name}`
        },
        confine: true,
      },
      grid: {
        left: '1%',
        bottom: 0,
        right: '1%',
        top: '2%',
      },
      xAxis: {
        type: 'category',
        show: false,
        boundaryGap: false,
        data: maturityThresholds.map(threshold => {
          return format(
            fromUnixTime((selectedRelic?.entry || 0) + parseInt(threshold)),
            'dd/MM/yyyy HH:mm'
          )
        }),
      },
      yAxis: {
        show: false,
        type: 'value',
        axisLabel: {
          formatter: '{value} W',
        },
        axisPointer: {
          show: false,
          snap: true,
          label: {
            formatter: function (params) {
              return fNumCustom((params.value as number) - 1, '0a')
            },
          },
        },
      },
      series: [
        {
          name: 'myline',
          type: 'line',
          smooth: true,
          itemStyle: {
            color: '#f30103',
          },
          lineStyle: {
            color: '#f30103',
          },
          areaStyle: {
            color: 'rgba(73, 21, 54, 0.4)',
          },
          data: poolDataAfter,
        },
        {
          name: 'myline',
          type: 'line',
          smooth: true,
          itemStyle: {
            color: '#00ffff',
          },
          lineStyle: {
            color: '#00ffff',
          },
          areaStyle: {
            color: 'rgba(0, 69, 87, 0.4)',
          },
          data: poolDataBefore,
        },
      ],
    }
  }, [isLoading, selectedRelic])
  return (
    <Card h="full" height="250px" px="2" py="4" width={{ base: 'full', lg: 'full' }}>
      <VStack height="full" spacing="2">
        <HStack alignItems="flex-start" height="fit-content" px="2" spacing="12" w="full">
          <VStack alignItems="flex-start" height="fit-content" spacing="0">
            <InfoButton
              infoText="This graph shows where this relics position is on the maturity curve and if you hover or tap, it will show an ETA for the next levels!"
              label="Projected maturity"
              labelProps={{
                lineHeight: '1rem',
                fontWeight: 'semibold',
                fontSize: 'md',
                color: 'beets.base.50',
              }}
            />
          </VStack>
        </HStack>
        <Box h="full" px="2" w="full">
          <ReactECharts option={chartOption} showLoading={isLoading} style={{ height: '100%' }} />
        </Box>
      </VStack>
    </Card>
  )
}
