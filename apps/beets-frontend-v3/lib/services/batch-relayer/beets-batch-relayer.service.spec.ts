import { decodeFunctionData } from 'viem'
import { BeetsBatchRelayerService } from './beets-batch-relayer.service'
import { beetsV2BatchRelayerLibraryAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'

const batchRelayerAddress = '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
const sender = '0x1111111111111111111111111111111111111111' as const
const recipient = '0x2222222222222222222222222222222222222222' as const
const token = '0x3333333333333333333333333333333333333333' as const

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
      poolId: 1n,
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
