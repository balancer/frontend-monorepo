import { decodeFunctionData } from 'viem'
import { ReliquaryActionsService } from './reliquary-actions.service'
import { beetsV2BatchRelayerLibraryAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import type {
  EncodeReliquaryCreateRelicAndAddLiquidityInput,
  EncodeReliquaryAddLiquidityInput,
  EncodeReliquaryRemoveLiquidityAndClaimInput,
  EncodeReliquaryHarvestAllInput,
} from '../reliquary-types'

const service = new ReliquaryActionsService()

// Real Sonic contract addresses
const sender = '0x1498437067d7bdDc4C9427964F073eE1AB4f50fC' as const // batch relayer
const recipient = '0x973670ce19594F857A7cD85EE834c7a74a941684' as const // reliquary
const token = '0x2D0E0814E62D80056181F5cd932274405966e4f0' as const // BEETS token (checksummed)

describe('ReliquaryActionsService', () => {
  describe('encodeCreateRelicAndAddLiquidity', () => {
    test('encodes valid calldata for reliquaryCreateRelicAndDeposit', () => {
      const params: EncodeReliquaryCreateRelicAndAddLiquidityInput = {
        sender,
        recipient,
        token,
        poolId: 0n, // real fBEETS farmId on Sonic
        amount: 1000000000000000000n,
        outputReference: 0n,
      }

      const encoded = service.encodeCreateRelicAndAddLiquidity(params)

      expect(encoded).toBeDefined()
      expect(encoded.startsWith('0x')).toBe(true)

      const decoded = decodeFunctionData({
        abi: beetsV2BatchRelayerLibraryAbi,
        data: encoded,
      })

      expect(decoded.functionName).toBe('reliquaryCreateRelicAndDeposit')
      expect(decoded.args).toEqual([sender, recipient, token, 0n, 1000000000000000000n, 0n])
    })
  })

  describe('encodeAddLiquidity', () => {
    test('encodes valid calldata for reliquaryDeposit', () => {
      const params: EncodeReliquaryAddLiquidityInput = {
        sender,
        token,
        relicId: 42n,
        amount: 500000000000000000n,
        outputReference: 1n,
      }

      const encoded = service.encodeAddLiquidity(params)

      expect(encoded).toBeDefined()
      expect(encoded.startsWith('0x')).toBe(true)

      const decoded = decodeFunctionData({
        abi: beetsV2BatchRelayerLibraryAbi,
        data: encoded,
      })

      expect(decoded.functionName).toBe('reliquaryDeposit')
      expect(decoded.args).toEqual([sender, token, 42n, 500000000000000000n, 1n])
    })
  })

  describe('encodeRemoveLiquidityAndClaim', () => {
    test('encodes valid calldata for reliquaryWithdrawAndHarvest', () => {
      const params: EncodeReliquaryRemoveLiquidityAndClaimInput = {
        recipient,
        relicId: 7n,
        amount: 250000000000000000n,
        outputReference: 2n,
      }

      const encoded = service.encodeRemoveLiquidityAndClaim(params)

      expect(encoded).toBeDefined()
      expect(encoded.startsWith('0x')).toBe(true)

      const decoded = decodeFunctionData({
        abi: beetsV2BatchRelayerLibraryAbi,
        data: encoded,
      })

      expect(decoded.functionName).toBe('reliquaryWithdrawAndHarvest')
      expect(decoded.args).toEqual([recipient, 7n, 250000000000000000n, 2n])
    })
  })

  describe('encodeHarvestAll', () => {
    test('encodes valid calldata for reliquaryHarvestAll', () => {
      const params: EncodeReliquaryHarvestAllInput = {
        relicIds: [1n, 2n, 3n],
        recipient,
      }

      const encoded = service.encodeHarvestAll(params)

      expect(encoded).toBeDefined()
      expect(encoded.startsWith('0x')).toBe(true)

      const decoded = decodeFunctionData({
        abi: beetsV2BatchRelayerLibraryAbi,
        data: encoded,
      })

      expect(decoded.functionName).toBe('reliquaryHarvestAll')
      expect(decoded.args).toEqual([[1n, 2n, 3n], recipient])
    })

    test('handles single relic id', () => {
      const params: EncodeReliquaryHarvestAllInput = {
        relicIds: [99n],
        recipient,
      }

      const encoded = service.encodeHarvestAll(params)
      const decoded = decodeFunctionData({
        abi: beetsV2BatchRelayerLibraryAbi,
        data: encoded,
      })

      expect(decoded.functionName).toBe('reliquaryHarvestAll')
      expect(decoded.args).toEqual([[99n], recipient])
    })

    test('handles empty relic ids', () => {
      const params: EncodeReliquaryHarvestAllInput = {
        relicIds: [],
        recipient,
      }

      const encoded = service.encodeHarvestAll(params)
      const decoded = decodeFunctionData({
        abi: beetsV2BatchRelayerLibraryAbi,
        data: encoded,
      })

      expect(decoded.functionName).toBe('reliquaryHarvestAll')
      expect(decoded.args).toEqual([[], recipient])
    })
  })
})
