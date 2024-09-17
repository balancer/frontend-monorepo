import { useMemo } from 'react'
import { useUserAccount } from '../web3/UserAccountProvider'
import { GaugeArg } from './useVebalBoost'

import { useMulticall } from '../web3/contracts/useMulticall'

import { AbiMap } from '../web3/contracts/AbiMap'
import { Hex } from 'viem'
import { getChainId, getGqlChain } from '@/lib/config/app.config'

type GaugeDataByPool = Record<string, { totalSupply: string; userBalance: string; gauge: GaugeArg }>

export function useGaugesSupplyAndBalance(gauges: GaugeArg[]) {
  const { userAddress } = useUserAccount()

  const gaugesTotalSupplyDataRequests = gauges.map(gauge => {
    return {
      chainId: getChainId(gauge.chain),
      id: `${gauge.chain}.${gauge.gaugeAddress}`,
      abi: AbiMap['balancer.LiquidityGauge'] as any,
      address: gauge.gaugeAddress as Hex,
      functionName: 'totalSupply',
      args: [],
    }
  })

  const { results: gaugesTotalSupply, isLoading: isLoadingTotalSupply } = useMulticall(
    gaugesTotalSupplyDataRequests
  )
  const gaugesBalancesDataRequests = gauges.map(gauge => {
    return {
      chainId: getChainId(gauge.chain),
      id: `${gauge.chain}.${gauge.gaugeAddress}`,
      abi: AbiMap['balancer.LiquidityGauge'] as any,
      address: gauge.gaugeAddress as Hex,
      functionName: 'balanceOf',
      args: [userAddress],
    }
  })

  const { results: gaugesBalances, isLoading: isLoadingBalances } = useMulticall(
    gaugesBalancesDataRequests
  )

  // get gauge total supply and user balance
  const gaugeDataByPoolMap = useMemo(() => {
    const totalSupplyData = Object.values(gaugesTotalSupply) as any[]
    const balancesData = Object.values(gaugesBalances) as any[]

    const totalSupplyDataGaugeMap = totalSupplyData.reduce((acc, v) => {
      if (v.status === 'error' || v.status === 'pending') {
        return acc
      }
      const chain = getGqlChain(Number(v.chainId))

      return {
        ...acc,
        ...v.data[chain],
      }
    }, {})

    const balancesDataGaugeMap = balancesData.reduce((acc, v) => {
      if (v.status === 'error' || v.status === 'pending') {
        return acc
      }
      const chain = getGqlChain(Number(v.chainId))

      return {
        ...acc,
        ...v.data[chain],
      }
    }, {})

    return gauges.reduce((acc: GaugeDataByPool, gauge) => {
      const totalSupply = totalSupplyDataGaugeMap[gauge.gaugeAddress]
      const balance = balancesDataGaugeMap[gauge.gaugeAddress]

      acc[gauge.poolId] = {
        totalSupply: totalSupply ? totalSupply.result : 0,
        userBalance: balance ? balance.result : 0,
        gauge,
      }
      return acc
    }, {})
  }, [gauges, gaugesTotalSupply, gaugesBalances])

  return { gaugeDataByPoolMap, isLoading: isLoadingTotalSupply || isLoadingBalances }
}
