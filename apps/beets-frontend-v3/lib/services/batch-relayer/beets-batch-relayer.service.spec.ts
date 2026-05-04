import { decodeFunctionData } from 'viem'
import { BeetsBatchRelayerService } from './beets-batch-relayer.service'
import { beetsV2BatchRelayerLibraryAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'

// Real Sonic contract addresses
const batchRelayerAddress = '0x1498437067d7bdDc4C9427964F073eE1AB4f50fC' // batch relayer
const sender = '0x1498437067d7bdDc4C9427964F073eE1AB4f50fC' as const // batch relayer
const recipient = '0x973670ce19594F857A7cD85EE834c7a74a941684' as const // reliquary
const token = '0x2D0E0814E62D80056181F5cd932274405966e4f0' as const // BEETS token (checksummed)

describe('BeetsBatchRelayerService', () => {
  let service: BeetsBatchRelayerService

  beforeEach(() => {
    service = BeetsBatchRelayerService.create(batchRelayerAddress)
  })

  test('create() returns a BeetsBatchRelayerService instance', () => {
    expect(service).toBeInstanceOf(BeetsBatchRelayerService)
    expect(service.batchRelayerAddress).toBe(batchRelayerAddress)
  })

  test('reliquaryEncodeCreateRelicAndAddLiquidity delegates correctly', () => {
    const encoded = service.reliquaryEncodeCreateRelicAndAddLiquidity({
      sender,
      recipient,
      token,
      poolId: 0n, // real fBEETS farmId on Sonic
      amount: 1000000000000000000n,
      outputReference: 0n,
    })

    const decoded = decodeFunctionData({
      abi: beetsV2BatchRelayerLibraryAbi,
      data: encoded,
    })

    expect(decoded.functionName).toBe('reliquaryCreateRelicAndDeposit')
  })

  test('reliquaryEncodeAddLiquidity delegates correctly', () => {
    const encoded = service.reliquaryEncodeAddLiquidity({
      sender,
      token,
      relicId: 42n,
      amount: 500000000000000000n,
      outputReference: 1n,
    })

    const decoded = decodeFunctionData({
      abi: beetsV2BatchRelayerLibraryAbi,
      data: encoded,
    })

    expect(decoded.functionName).toBe('reliquaryDeposit')
  })

  test('reliquaryEncodeRemoveLiquidityAndClaim delegates correctly', () => {
    const encoded = service.reliquaryEncodeRemoveLiquidityAndClaim({
      recipient,
      relicId: 7n,
      amount: 250000000000000000n,
      outputReference: 2n,
    })

    const decoded = decodeFunctionData({
      abi: beetsV2BatchRelayerLibraryAbi,
      data: encoded,
    })

    expect(decoded.functionName).toBe('reliquaryWithdrawAndHarvest')
  })

  test('reliquaryEncodeHarvestAll delegates correctly', () => {
    const encoded = service.reliquaryEncodeHarvestAll({
      relicIds: [1n, 2n, 3n],
      recipient,
    })

    const decoded = decodeFunctionData({
      abi: beetsV2BatchRelayerLibraryAbi,
      data: encoded,
    })

    expect(decoded.functionName).toBe('reliquaryHarvestAll')
  })

  test('inherits base BatchRelayerService methods', () => {
    // Verify the service has inherited methods from BatchRelayerService
    expect(typeof service.encodePeekChainedReferenceValue).toBe('function')
    expect(typeof service.gaugeEncodeDeposit).toBe('function')
    expect(typeof service.gaugeEncodeWithdraw).toBe('function')
  })
})
