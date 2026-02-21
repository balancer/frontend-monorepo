import { Path } from '@balancer/sdk'
import { ECharts, EChartsOption } from 'echarts'
import { useCallback, useRef } from 'react'
import { useTokens } from '../tokens/TokensProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { bn } from '@repo/lib/shared/utils/numbers'
import { getTokenColor } from '@repo/lib/styles/token-colors'
import { Address } from 'viem'

type TokenItem = {
  id: string
  symbol: string
}

type HopItem = {
  source: string
  target: string
  value: number
}

export function useRoutesChart(paths: Path[] | undefined, chain: GqlChain) {
  const instanceRef = useRef<ECharts | undefined>(undefined)
  const onChartReady = useCallback((instance: ECharts) => {
    instanceRef.current = instance
  }, [])

  const { getToken } = useTokens()

  if (!paths || paths.length === 0) return {}

  const tokens: TokenItem[] = []
  const hops: HopItem[] = []

  const totalAmount = paths?.reduce((acc, path) => acc + path.inputAmountRaw, 0n)

  paths.forEach(path => {
    path.tokens.forEach((token, i) => {
      if (!tokens.some(token2 => token.address === token2.id)) {
        const tokenInfo = getToken(token.address, chain)
        tokens.push({
          id: token.address,
          symbol: tokenInfo?.symbol || '',
        })
      }

      if (i < path.tokens.length - 1) {
        hops.push({
          source: token.address,
          target: path.tokens[i + 1].address,
          value: bn(path.inputAmountRaw).div(totalAmount).toNumber(),
        })
      }
    })
  })

  const chartData: EChartsOption = {
    series: [
      {
        type: 'sankey' as const,
        nodeWidth: 40,
        data: tokens.map(token => ({
          id: token.id,
          name: token.symbol,
          label: {
            distance: -20, // Pushes the text 10px above the rectangle
            align: 'center', // Centers the text horizontally over the node
            formatter: `${token.symbol}`,
          },
          itemStyle: {
            color: getTokenColor(chain, token.id as Address).from,
            borderColor: getTokenColor(chain, token.id as Address).from,
            borderWidth: 2,
          },
        })),
        links: hops.map(hop => ({
          source: hop.source,
          target: hop.target,
          value: hop.value,
          lineStyle: {
            color: 'gradient',
            borderColor: '#ffffff', // Set this to your chart's background color
            borderWidth: 2, // This acts as your "margin"
          },
        })),
      },
    ],
  }

  return {
    chartData,
    onChartReady,
  }
}
