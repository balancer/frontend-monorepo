import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { getApiPoolMock } from '../../__mocks__/api-mocks/api-mocks'
import { partialBoosted } from '../../__mocks__/pool-examples/boosted'
import { balWeth8020 } from '../../__mocks__/pool-examples/flat'
import { getApprovalAndRemoveSteps } from './useRemoveLiquiditySteps'

const v2Pool = getApiPoolMock(balWeth8020)
const v3Pool = getApiPoolMock(partialBoosted)
const mockTransactionStep = (id: string, completed = false): TransactionStep =>
  ({
    id,
    isComplete: () => completed,
    nestedSteps: [],
  }) as unknown as TransactionStep

const removeLiquidityStep = mockTransactionStep('removeLiquidityStep')
const signPermitStep = mockTransactionStep('signPermitStep')
const tokenApprovalSteps = [
  mockTransactionStep('tokenApprovalStep1'),
  mockTransactionStep('tokenApprovalStep2'),
]

describe('getApprovalAndRemoveSteps', () => {
  it('for not v3 pools (v1 and v2 pools)', () => {
    const steps = getApprovalAndRemoveSteps({
      pool: v2Pool,
      isSafeAccount: false,
      shouldUseSignatures: true,
      shouldBatchTransactions: false,
      tokenApprovalSteps,
      signPermitStep,
      removeLiquidityStep,
    })

    expect(steps).toEqual([removeLiquidityStep])
  })

  describe('for v3 pools', () => {
    it('with enabled signatures', () => {
      const steps = getApprovalAndRemoveSteps({
        pool: v3Pool,
        isSafeAccount: false,
        shouldUseSignatures: true,
        shouldBatchTransactions: false,
        tokenApprovalSteps,
        signPermitStep,
        removeLiquidityStep,
      })

      expect(steps).toEqual([signPermitStep, removeLiquidityStep])
    })

    it('with enabled signatures and batched transactions', () => {
      const steps = getApprovalAndRemoveSteps({
        pool: v3Pool,
        isSafeAccount: true,
        shouldUseSignatures: true,
        shouldBatchTransactions: true,
        tokenApprovalSteps,
        signPermitStep,
        removeLiquidityStep,
      })

      expect(steps).toEqual([removeLiquidityStep])
      expect(removeLiquidityStep.nestedSteps).toEqual(tokenApprovalSteps)
    })

    it('with disabled signatures', () => {
      const steps = getApprovalAndRemoveSteps({
        pool: v3Pool,
        isSafeAccount: false,
        shouldUseSignatures: false,
        shouldBatchTransactions: false,
        tokenApprovalSteps,
        signPermitStep,
        removeLiquidityStep,
      })

      expect(steps).toEqual([...tokenApprovalSteps, removeLiquidityStep])
    })

    it('with disabled signatures and batched transactions', () => {
      const steps = getApprovalAndRemoveSteps({
        pool: v3Pool,
        isSafeAccount: true,
        shouldUseSignatures: false,
        shouldBatchTransactions: true,
        tokenApprovalSteps,
        signPermitStep,
        removeLiquidityStep,
      })

      expect(steps).toEqual([removeLiquidityStep])
      expect(removeLiquidityStep.nestedSteps).toEqual(tokenApprovalSteps)
    })

    it('with Safe account but no batched transactions', () => {
      const steps = getApprovalAndRemoveSteps({
        pool: v3Pool,
        isSafeAccount: true,
        shouldUseSignatures: false,
        shouldBatchTransactions: false,
        tokenApprovalSteps,
        signPermitStep,
        removeLiquidityStep,
      })

      expect(steps).toEqual([...tokenApprovalSteps, removeLiquidityStep])
    })
  })
})
