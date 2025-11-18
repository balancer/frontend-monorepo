import { BatchRelayerService } from '@repo/lib/shared/services/batch-relayer/batch-relayer.service'
import { gaugeActionsService } from '@repo/lib/shared/services/batch-relayer/extensions/gauge-actions.service'
import { vaultActionsService } from '@repo/lib/shared/services/batch-relayer/extensions/vault-actions.service'
import {
  reliquaryActionsService,
  ReliquaryActionsService,
} from './extensions/reliquary-actions.service'
import type {
  EncodeReliquaryCreateRelicAndDepositInput,
  EncodeReliquaryDepositInput,
  EncodeReliquaryWithdrawAndHarvestInput,
} from './reliquary-types'
import { Hex } from 'viem'

export class BeetsBatchRelayerService extends BatchRelayerService {
  constructor(
    batchRelayerAddress: string,
    private readonly reliquaryActionsService: ReliquaryActionsService
  ) {
    super(batchRelayerAddress, gaugeActionsService, vaultActionsService)
  }

  static create(batchRelayerAddress: string): BeetsBatchRelayerService {
    return new BeetsBatchRelayerService(batchRelayerAddress, reliquaryActionsService)
  }

  // Reliquary-specific methods
  public reliquaryEncodeCreateRelicAndDeposit(
    params: EncodeReliquaryCreateRelicAndDepositInput
  ): Hex {
    return this.reliquaryActionsService.encodeCreateRelicAndDeposit(params)
  }

  public reliquaryEncodeDeposit(params: EncodeReliquaryDepositInput): Hex {
    return this.reliquaryActionsService.encodeDeposit(params)
  }

  public reliquaryEncodeWithdrawAndHarvest(params: EncodeReliquaryWithdrawAndHarvestInput): Hex {
    return this.reliquaryActionsService.encodeWithdrawAndHarvest(params)
  }
}
