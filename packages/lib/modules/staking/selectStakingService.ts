import { GaugeService } from '@repo/lib/shared/services/staking/gauge.service'
import { BatchRelayerService } from '@repo/lib/shared/services/batch-relayer/batch-relayer.service'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { gaugeActionsService } from '@repo/lib/shared/services/batch-relayer/extensions/gauge-actions.service'
import { reliquaryActionsService } from '@repo/lib/shared/services/batch-relayer/extensions/reliquary-actions.service'
import { vaultActionsService } from '@repo/lib/shared/services/batch-relayer/extensions/vault-actions.service'
import { GqlChain, GqlPoolStakingType } from '@repo/lib/shared/services/api/generated/graphql'

export function selectStakingService(chain: GqlChain, stakingType: GqlPoolStakingType) {
  const networkConfig = getNetworkConfig(chain)
  const batchRelayerService = new BatchRelayerService(
    networkConfig.contracts.balancer.relayerV6,
    gaugeActionsService,
    reliquaryActionsService,
    vaultActionsService
  )

  if (stakingType === 'GAUGE') {
    return new GaugeService(batchRelayerService)
  }
}
