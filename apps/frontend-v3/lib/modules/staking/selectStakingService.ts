import { GaugeService } from '@/lib/shared/services/staking/gauge.service'
import { BatchRelayerService } from '@/lib/shared/services/batch-relayer/batch-relayer.service'
import { getNetworkConfig } from '@/lib/config/app.config'
import { gaugeActionsService } from '@/lib/shared/services/batch-relayer/extensions/gauge-actions.service'
import { GqlChain, GqlPoolStakingType } from '@repo/api/graphql'

export function selectStakingService(chain: GqlChain, stakingType: GqlPoolStakingType) {
  const networkConfig = getNetworkConfig(chain)
  const batchRelayerService = new BatchRelayerService(
    networkConfig.contracts.balancer.relayerV6,
    gaugeActionsService
  )

  if (stakingType === 'GAUGE') {
    return new GaugeService(batchRelayerService)
  }
}
