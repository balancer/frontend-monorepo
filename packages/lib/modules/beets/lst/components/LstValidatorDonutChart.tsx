import { useMemo } from 'react'
import { EChartsOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { fNum } from '@repo/lib/shared/utils/numbers'

interface Props {
  data: any
}

export function LstValidatorDonutChart({ data }: Props) {
  const option = useMemo<EChartsOption>(
    () => ({
      color: [
        '#D81B60',
        '#8E24AA',
        '#5E35B1',
        '#3949AB',
        '#1E88E5',
        '#039BE5',
        '#00ACC1',
        '#00897B',
        '#43A047',
        '#7CB342',
        '#C0CA33',
        '#FFB300',
        '#FB8C00',
        '#F4511E',
        '#6D4C41',
        '#757575',
        '#546E7A',
        '#b71c1c',
        '#880E4F',
        '#4A148C',
        '#311B92',
        '#1A237E',
        '#0D47A1',
        '#01579B',
        '#006064',
        '#004D40',
        '#1B5E20',
        '#33691E',
        '#827717',
        '#F57F17',
        '#FF6F00',
        '#E65100',
        '#BF360C',
        '#3E2723',
        '#212121',
        '#263238',
        '#801313',
      ],
      darkMode: true,
      tooltip: {
        trigger: 'item',
        type: 'shadow',
        borderColor: 'transparent',
        borderRadius: 8,
        textStyle: {
          color: 'white',
        },
      },
      animation: false,
      series: [
        {
          type: 'pie',
          data,
          radius: ['40%', '70%'],
          emphasis: {
            itemStyle: {
              shadowBlur: 40,
              shadowColor: 'rgba(0, 0, 0, 0.75)',
            },
            labelLine: {
              lineStyle: {
                width: 3,
              },
            },
          },
          width: '100%',
          label: {
            overflow: 'none',
          },
          tooltip: {
            valueFormatter: value => `${fNum('token', (value as string) || '0')} S staked`,
          },
          padAngle: 1,
          itemStyle: {
            borderRadius: 10,
          },
        },
      ],
    }),
    [data]
  )

  //   const onChartClick = (params: any) => {
  //     if (params && params.data.validatorAddress) {
  //       window.open(
  //         `https://fantom.foundation/validatorStats?address=${params.data.validatorAddress}`,
  //         '_blank',
  //         'noopener,noreferrer'
  //       )
  //     }
  //   }

  //   const onEvents = {
  //     click: onChartClick,
  //   }

  return (
    <ReactECharts
      //onEvents={onEvents}
      option={option}
      style={{ height: '400px', width: '100%' }}
    />
  )
}
