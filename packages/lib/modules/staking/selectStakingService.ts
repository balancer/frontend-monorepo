import { GaugeService } from '../../shared/services/staking/gauge.service'
import { BatchRelayerService } from '../../shared/services/batch-relayer/batch-relayer.service'
import { getNetworkConfig } from '../../config/app.config'
import { gaugeActionsService } from '../../shared/services/batch-relayer/extensions/gauge-actions.service'
import { GqlChain, GqlPoolStakingType } from '../../shared/services/api/generated/graphql'

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
