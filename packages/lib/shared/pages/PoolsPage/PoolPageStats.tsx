'use client'

import Stat from '../../components/other/Stat'
import { fNumCustom } from '../../utils/numbers'
import { useProtocolStats } from '@repo/lib/modules/protocol/ProtocolStatsProvider'

export function PoolPageStats() {
  const { protocolData } = useProtocolStats()

  return (
    <>
      <Stat
        label="TVL"
        value={fNumCustom(protocolData?.protocolMetricsAggregated.totalLiquidity ?? 0, '$0,0.0a')}
      />
      <Stat
        imageBackgroundSize="300%"
        label="Volume (24h)"
        value={fNumCustom(protocolData?.protocolMetricsAggregated.swapVolume24h ?? 0, '$0,0.0a')}
      />
      <Stat
        imageTransform="rotate(180deg)"
        label="Fees (24h)"
        value={fNumCustom(protocolData?.protocolMetricsAggregated.swapFee24h ?? 0, '$0,0.0a')}
      />
    </>
  )
}
