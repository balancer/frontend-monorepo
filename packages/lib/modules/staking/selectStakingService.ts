import { GaugeService } from '@repo/lib/shared/services/staking/gauge.service'
import { BatchRelayerService } from '@repo/lib/shared/services/batch-relayer/batch-relayer.service'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { GqlChain, GqlPoolStakingType } from '@repo/lib/shared/services/api/generated/graphql'

export function selectStakingService(chain: GqlChain, stakingType: GqlPoolStakingType) {
  const networkConfig = getNetworkConfig(chain)
  const batchRelayerService = BatchRelayerService.create(
    networkConfig.contracts.balancer.relayerV6,
    false
  )

  if (stakingType === 'GAUGE') {
    return new GaugeService(batchRelayerService)
  }
}
