import { EChartsOption, graphic } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { addWeeks, format, fromUnixTime } from 'date-fns'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useMemo } from 'react'
import { ReliquaryFarmPosition } from '../../ReliquaryProvider'

interface RelicMaturityCurveChartProps {
  relic: ReliquaryFarmPosition
  isFocused?: boolean
}

export function RelicMaturityCurveChart({ relic, isFocused = true }: RelicMaturityCurveChartProps) {
  const { pool } = usePool()

  const { level: currentLevel, entry } = relic

  const allLevelsData = useMemo(() => {
    return (
      pool.staking?.reliquary?.levels
        ?.map(level => ({
          level: level.level + 1, // Display level (1-11)
          allocationPoints: level.allocationPoints,
        }))
        .slice(0, 11) || []
    )
  }, [pool.staking?.reliquary?.levels])

  const option = useMemo<EChartsOption>(() => {
    const displayCurrentLevel = currentLevel + 1 // Convert 0-10 to 1-11

    // Create full-length arrays with null for missing points (for proper index-based matching)
    const completedSeriesData = allLevelsData.map(d =>
      d.level <= displayCurrentLevel ? d.allocationPoints : null
    )

    const remainingSeriesData = allLevelsData.map(d =>
      d.level >= displayCurrentLevel ? d.allocationPoints : null
    )

    // Get the current level's allocation points for the marker
    const currentLevelData = allLevelsData.find(d => d.level === displayCurrentLevel)

    return {
      tooltip: {
        show: isFocused,
        appendToBody: true,
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: '#3182CE',
            width: 1,
            type: 'dashed',
          },
        },
        formatter: (params: any) => {
          const level = Number(params[0]?.axisValue ?? params[0]?.data?.[0])
          const levelData = allLevelsData.find(dataPoint => dataPoint.level === level)
          const boost = levelData?.allocationPoints ?? params[0]?.data?.[1] ?? params[0]?.value
          const entryDate = fromUnixTime(entry)
          const maturityDate = addWeeks(entryDate, Math.max(level - 1, 0))
          const formattedMaturityDate = format(maturityDate, 'dd/MM/yy HH:mm')
          return `Level: ${level}<br/>Boost: ${boost}x<br/>Maturity date: ${formattedMaturityDate}`
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#3182CE',
        borderWidth: 1,
        textStyle: {
          color: '#D3D3D3',
        },
      },
      grid: {
        left: '0%',
        right: '2%',
        top: '10%',
        bottom: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: allLevelsData.map(d => d.level),
        axisLine: {
          show: true,
          lineStyle: {
            color: '#444',
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#888',
          fontSize: 10,
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        show: false,
      },
      series: [
        // Completed portion (filled blue)
        {
          name: 'Completed',
          type: 'line',
          smooth: true,
          data: completedSeriesData,
          lineStyle: {
            color: '#3182CE',
            width: 2,
          },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(49, 130, 206, 0.6)' },
              { offset: 0.5, color: 'rgba(49, 130, 206, 0.4)' },
              { offset: 1, color: 'rgba(49, 130, 206, 0.1)' },
            ]),
          },
          symbol: 'none',
        },
        // Remaining portion (light outline)
        {
          name: 'Remaining',
          type: 'line',
          smooth: true,
          data: remainingSeriesData,
          lineStyle: {
            color: '#444',
            width: 2,
            type: 'dashed',
          },
          areaStyle: {
            color: 'rgba(68, 68, 68, 0.05)',
          },
          symbol: 'none',
        },
        // Current level marker
        {
          name: 'Current',
          type: 'scatter',
          data: currentLevelData ? [[currentLevel, currentLevelData.allocationPoints]] : [],
          symbolSize: 12,
          itemStyle: {
            color: '#3182CE',
            borderColor: '#fff',
            borderWidth: 2,
          },
          z: 10,
        },
      ],
    }
  }, [allLevelsData, currentLevel, entry, isFocused])

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
}
