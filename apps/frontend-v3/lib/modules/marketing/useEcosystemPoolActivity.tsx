/* eslint-disable max-len */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import * as echarts from 'echarts/core'
import { useEffect, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import { GqlChain, GqlPoolEventType, GqlToken } from '@/lib/shared/services/api/generated/graphql'
import EChartsReactCore from 'echarts-for-react/lib/core'
import { ColorMode, useTheme as useChakraTheme } from '@chakra-ui/react'
import { useTheme as useNextTheme } from 'next-themes'
import { abbreviateAddress } from '@/lib/shared/utils/addresses'
import { useTokens } from '@/lib/modules/tokens/TokensProvider'

import {
  getBlockExplorerAddressUrl,
  getBlockExplorerTxUrl,
} from '@/lib/shared/hooks/useBlockExplorer'
import { useBreakpoints } from '@/lib/shared/hooks/useBreakpoints'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { NumberFormatter } from '@/lib/shared/utils/numbers'
import { usePoolEvents } from '../pool/usePoolEvents'
import { supportedNetworks } from '../web3/ChainConfig'
import { getChainShortName } from '@/lib/config/app.config'

type ChartInfoTokens = {
  token?: GqlToken
  amount: string
}

export type ChartInfoMetaData = {
  userAddress: string
  tokens: ChartInfoTokens[]
  tx: string
  usdValue: string
  chain: GqlChain
  type: GqlPoolEventType
}

type ChartEl = [number, string, ChartInfoMetaData]

export type ChartInfo = Record<GqlChain, ChartEl[]>

export const gradientMap: Record<GqlChain, { from: string; to: string }> = {
  [GqlChain.Arbitrum]: {
    from: '#6C80A7',
    to: '#2D374B',
  },
  [GqlChain.Mainnet]: {
    from: '#F7F7F7',
    to: '#A4C6EE',
  },
  [GqlChain.Base]: {
    from: '#99B9FF',
    to: '#0252FF',
  },
  [GqlChain.Optimism]: {
    from: '#FF9EA9',
    to: '#FF0420',
  },
  [GqlChain.Polygon]: {
    from: '#DECEF8',
    to: '#8247E5',
  },
  [GqlChain.Zkevm]: {
    from: '#CD6BE1',
    to: '#7C40E4',
  },
  [GqlChain.Gnosis]: {
    from: '#07DEA7',
    to: '#04795B',
  },
  [GqlChain.Avalanche]: {
    from: '#F39B9B',
    to: '#DA1A1C',
  },
  [GqlChain.Fantom]: {
    from: '#7D84FF',
    to: '#5468FF',
  },
  [GqlChain.Fraxtal]: {
    from: '#E0E7FF',
    to: '#8C9EFF',
  },
  [GqlChain.Mode]: {
    from: '#FFD77D',
    to: '#FFB74D',
  },
  [GqlChain.Sepolia]: {
    from: '#D1B3FF',
    to: '#A384FF',
  },
}

function getDefaultChainMeta() {
  return {
    [GqlChain.Mainnet]: [],
    [GqlChain.Arbitrum]: [],
    [GqlChain.Polygon]: [],
    [GqlChain.Base]: [],
    [GqlChain.Optimism]: [],
    [GqlChain.Zkevm]: [],
    [GqlChain.Gnosis]: [],
    [GqlChain.Avalanche]: [],
    [GqlChain.Fantom]: [],
    [GqlChain.Fraxtal]: [],
    [GqlChain.Mode]: [],
    [GqlChain.Sepolia]: [],
  }
}

const getDefaultPoolActivityChartOptions = (
  nextTheme: ColorMode = 'dark',
  theme: any, // TODO: type this
  currencyFormatter: NumberFormatter,
  isMobile = false,
  is2xl = false
  // chain: GqlChain
): echarts.EChartsCoreOption => {
  const toolTipTheme = {
    heading: 'font-weight: bold; color: #E5D3BE',
    container: `background: ${
      nextTheme === 'dark'
        ? theme.semanticTokens.colors.background.level3._dark
        : theme.semanticTokens.colors.background.default
    };`,
    text:
      nextTheme === 'dark'
        ? theme.semanticTokens.colors.font.primary._dark
        : theme.semanticTokens.colors.font.primary.default,
  }

  return {
    grid: {
      left: isMobile ? '15%' : '5.5%',
      right: '2.5%',
      top: '7.5%',
      bottom: '10.5%',
      containLabel: false,
    },
    xAxis: {
      show: false,
      offset: 10,
      type: 'time',
      minorSplitLine: { show: false },
      axisTick: { show: false },
      splitNumber: 3,
      axisPointer: {
        type: 'line',
        label: {
          formatter: (params: any) => {
            return format(new Date(params.value * 1000), 'MMM d')
          },
        },
      },
      axisLine: { show: false },
      splitArea: {
        show: false,
        areaStyle: {
          color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)'],
        },
      },
    },
    yAxis: {
      show: true,
      offset: 10,
      type: 'value',
      axisLabel: {
        formatter: (value: number) => {
          return currencyFormatter(value ** 2)
        },
      },
      axisLine: { show: false },
      minorSplitLine: { show: false },
      splitLine: { show: false },
      splitNumber: 3,
    },
    tooltip: {
      triggerOn: 'mousemove|click',
      confine: is2xl ? false : true,
      enterable: true,
      hideDelay: 300,
      position: function (point: number[]) {
        return [point[0] + 5, point[1] - 5]
      },
      extraCssText: `padding-right:2rem;border: none;${toolTipTheme.container};pointer-events: auto!important`,
      formatter: (params: any) => {
        const data = Array.isArray(params) ? params[0] : params
        const timestamp = data.value[0]
        const metaData = data.data[2] as ChartInfoMetaData
        const userAddress = metaData.userAddress
        const tokens = metaData.tokens.filter(token => {
          if (!token.token) return false
          if (Number(token.amount) === 0) return false
          return true
        }) as ChartInfoTokens[]

        const tx = metaData.tx
        const txLink = getBlockExplorerTxUrl(tx, metaData.chain)
        const addressLink = getBlockExplorerAddressUrl(userAddress, metaData.chain)
        const typeStr =
          metaData.type === GqlPoolEventType.Add
            ? 'Add'
            : metaData.type === GqlPoolEventType.Remove
            ? 'Remove'
            : 'Swap'

        const arrow = `<svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" fill="none"><path stroke="#718096" stroke-linecap="round" stroke-linejoin="round" d="M2 1h6v6M1 8l7-7"/></svg>`

        return `
          <div style="max-width: 152px; padding: none; display: flex; flex-direction: column;${
            toolTipTheme.container
          };margin-right:-15px">
            <div style="font-size: 14px; font-weight: 700;
            display:flex;flex-wrap:wrap;justify-content:start;gap:0px;letter-spacing:-0.25px; padding-bottom:2px;${
              toolTipTheme.heading
            }; color: ${toolTipTheme.text}; ">
              <span>${typeStr} </span>
              <span>&nbsp;${currencyFormatter(metaData.usdValue)}&nbsp;</span>
              <span>on ${getChainShortName(metaData.chain)}</span>
            </div>
            <div style="display:flex;flex-direction:column;justify-content:flex-start;gap:0;margin-top:4px";>
              ${tokens?.map((token, index) => {
                return `
                  <div style="color: ${
                    toolTipTheme.text
                  }; display:flex;justify-content:start;align-items:center;gap:6px; margin-bottom:${
                  index === tokens.length - 1 ? `4px` : `-20px`
                }">
                    <img src="${
                      token.token?.logoURI
                    }" style="width: 16px; height: 16px; border-radius: 50%; margin-right;letter-spacing:-0.1px" />
                    <div style="text-align:left">
                      <span>${Number(Number(token.amount).toFixed(2)).toLocaleString()}</span>
                      <span>${token.token?.symbol}</span>
                    </div>
                  </div>
                `
              })}
            </div>
            <a style="width:100%;display:flex;align-items:center;font-size: 0.75rem; padding-top:4px;font-weight: 500; color: ${
              toolTipTheme.text
            };" href=${txLink} target="_blank">
            <span style="margin-right:4px;">
                    Tx: ${format(new Date(timestamp * 1000), 'MMM d, h:mma')
                      .replace('AM', 'am')
                      .replace('PM', 'pm')}
                  </span>

              ${arrow}
            </a>
            <div style="width:100%;display:flex;align-items:center;font-size: 0.75rem; line-height:1;font-weight: 500; margin-top:4px; color: ${
              toolTipTheme.text
            };">
                <a style="display:flex;align-items:center;" href=${addressLink} target="_blank">
                  <span style="font-size: 0.75rem; margin-right:4px;">By: ${abbreviateAddress(
                    userAddress
                  )}</span>
                  ${arrow}
                </a>
            </div>
          </div>
      `
      },
    },
  }
}

function getSymbolSize(dataItem?: ChartEl) {
  if (!dataItem) return 0

  const value = Number(dataItem[2].usdValue)
  if (value < 7812) return 8
  if (value < 15625) return 12
  if (value < 31250) return 16
  if (value < 62500) return 20
  if (value < 125000) return 24
  if (value < 250000) return 28
  if (value < 500000) return 32

  return 40
}

export type PoolActivityChartTab = 'all' | 'adds' | 'swaps' | 'removes'

export interface PoolActivityChartTypeTab {
  value: GqlPoolEventType | 'all'
  label: string
}

const tabsList: PoolActivityChartTypeTab[] = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Adds',
    value: GqlPoolEventType.Add,
  },
  {
    label: 'Removes',
    value: GqlPoolEventType.Remove,
  },
  {
    label: 'Swaps',
    value: GqlPoolEventType.Swap,
  },
]

export function useEcosystemPoolActivityChart() {
  const eChartsRef = useRef<EChartsReactCore | null>(null)
  const { isMobile, is2xl } = useBreakpoints()
  const { theme: nextTheme } = useNextTheme()
  const { getToken } = useTokens()
  const { toCurrency } = useCurrency()
  const [activeTab, setActiveTab] = useState<PoolActivityChartTypeTab>(tabsList[0])
  const [activeNetwork, setActiveNetwork] = useState<GqlChain | 'all'>('all')

  const theme = useChakraTheme()

  const { loading, data: response } = usePoolEvents({
    first: 500,
    chainIn: supportedNetworks,
  })

  const chartData = useMemo(() => {
    if (!response) return getDefaultChainMeta()
    const { poolEvents: events } = response

    const data = events.reduce((acc: ChartInfo, item) => {
      const { type, timestamp, valueUSD, userAddress, tx, chain } = item

      if (activeTab.value !== 'all' && type !== activeTab.value) {
        return acc
      }

      if (activeNetwork !== 'all' && chain !== activeNetwork) {
        return acc
      }

      const usdValue = valueUSD.toString() ?? ''
      const tokens: ChartInfoTokens[] = []

      if (item.__typename === 'GqlPoolAddRemoveEventV3') {
        item.tokens.forEach(token => {
          tokens.push({
            token: getToken(token.address, chain),
            amount: token.amount,
          })
        })
      }

      if (
        item.__typename === 'GqlPoolSwapEventV3' ||
        item.__typename === 'GqlPoolSwapEventCowAmm'
      ) {
        tokens.push({
          token: getToken(item.tokenIn.address, chain),
          amount: item.tokenIn.amount,
        })
        tokens.push({
          token: getToken(item.tokenOut.address, chain),
          amount: item.tokenOut.amount,
        })
      }

      const chartYAxisValue = Math.sqrt(Number(usdValue))

      acc[chain].push([
        timestamp,
        chartYAxisValue.toString(),
        { userAddress, tokens, usdValue, tx, chain, type },
      ])

      return acc
    }, getDefaultChainMeta())

    return data
  }, [response, activeNetwork, activeTab])

  const headerInfo = useMemo(() => {
    if (!response) return { total: 0, elapsedMinutes: 0 }

    const elapsedMinutes = Math.floor(
      (Date.now() / 1000 - response.poolEvents[response.poolEvents.length - 1].timestamp) / 60
    )

    const total = Object.keys(chartData).reduce((acc, chain) => {
      return acc + chartData[chain as GqlChain].length
    }, 0)

    return { total, elapsedMinutes }
  }, [response, chartData])

  const options = useMemo(() => {
    return supportedNetworks.map(chain => {
      return {
        name: chain,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: gradientMap[chain].from,
            },
            {
              offset: 1,
              color: gradientMap[chain].to,
            },
          ]),
        },
        emphasis: {
          focus: 'self',
          scale: 1.5,
        },
        symbolSize: getSymbolSize,
        data: chartData[chain],
        type: 'scatter',
      }
    })
  }, [chartData])

  useEffect(() => {
    const instance = eChartsRef.current?.getEchartsInstance()
    if (!instance) return

    return instance.setOption({
      series: options,
    })
  }, [chartData, options])

  return {
    isLoading: loading,
    chartOption: getDefaultPoolActivityChartOptions(
      nextTheme as ColorMode,
      theme,
      toCurrency,
      isMobile,
      is2xl
    ),
    eChartsRef,
    chartData,
    tabsList,
    activeTab,
    setActiveTab,
    activeNetwork,
    setActiveNetwork,
    headerInfo,
  }
}
