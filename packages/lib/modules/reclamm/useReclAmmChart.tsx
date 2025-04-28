import { useComputeInvariant } from './useComputeInvariant'
import { useComputeCurrentVirtualBalances } from './useComputeCurrentVirtualBalances'
import { useGetReClammPoolDynamicData } from './useGetReClammPoolDynamicData'
import { useMemo } from 'react'
import { bn } from 'shared/utils/numbers'
import { formatUnits } from 'viem'

export function useReclAmmChart() {
  const { invariant: invariantRaw } = useComputeInvariant()
  const { virtualBalances } = useComputeCurrentVirtualBalances()
  const { dynamicData } = useGetReClammPoolDynamicData()

  console.log({ invariantRaw, virtualBalances, dynamicData })

  const currentChartData = useMemo(() => {
    if (
      !invariantRaw ||
      !virtualBalances ||
      !virtualBalances.virtualBalanceA ||
      !virtualBalances.virtualBalanceB
    ) {
      return []
    }

    const virtualBalanceA = formatUnits(virtualBalances.virtualBalanceA, 18)
    const virtualBalanceB = formatUnits(virtualBalances.virtualBalanceB, 18)
    const invariant = formatUnits(invariantRaw, 18)

    const xForPointB = bn(invariant).div(virtualBalanceB)

    // Create regular curve points
    const curvePoints = Array.from({ length: 100 }, (_, i) => {
      const x = bn(0.7)
        .times(virtualBalanceA)
        .plus(
          bn(i)
            .times(bn(1.3).times(xForPointB).minus(bn(0.7).times(virtualBalanceA)))
            .div(bn(100))
        )
      const y = bn(invariant).div(x)

      return [x.toNumber(), y.toNumber()]
    })

    return curvePoints
  }, [invariantRaw, virtualBalances])

  console.log({ currentChartData })

  const option = useMemo(() => {
    if (!currentChartData.length) return {}

    return {
      xAxis: {
        type: 'value',
        min: currentChartData[0][0],
        max: currentChartData[currentChartData.length - 1][0],
      },
      yAxis: {
        type: 'value',
        min: currentChartData[0][1],
        max: currentChartData[currentChartData.length - 1][1],
      },
      series: [
        {
          data: currentChartData,
          type: 'line',
          smooth: true,
        },
      ],
    }
  }, [currentChartData])

  return { option }
}
