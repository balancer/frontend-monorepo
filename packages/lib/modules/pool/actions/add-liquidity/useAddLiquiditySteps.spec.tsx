import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { getApprovalAndAddSteps } from './useAddLiquiditySteps'

const mockTransactionStep = (id: string, completed = false): TransactionStep =>
  ({
    id,
    isComplete: () => completed,
    nestedSteps: [],
  }) as unknown as TransactionStep

const addLiquidityStep = mockTransactionStep('addLiquidityStep')
const signPermit2Step = mockTransactionStep('signPermit2Step')
const tokenApprovalSteps = [
  mockTransactionStep('tokenApprovalStep1'),
  mockTransactionStep('tokenApprovalStep2'),
]
const permit2ApprovalSteps = [
  mockTransactionStep('permit2ApprovalStep1'),
  mockTransactionStep('permit2ApprovalStep2'),
]

describe('getApprovalAndAddSteps', () => {
  describe('for v1 and v2 pools', () => {
    it('standard permit add', () => {
      const steps = getApprovalAndAddSteps({
        isPermit2: false,
        shouldUseSignatures: true,
        shouldBatchTransactions: false,
        permit2ApprovalSteps,
        tokenApprovalSteps,
        signPermit2Step,
        addLiquidityStep,
      })

      expect(steps).toEqual([...tokenApprovalSteps, addLiquidityStep])
    })

    it('standard permit add with Safe tx batch', () => {
      const steps = getApprovalAndAddSteps({
        isPermit2: false,
        shouldUseSignatures: false,
        shouldBatchTransactions: true,
        permit2ApprovalSteps,
        tokenApprovalSteps,
        signPermit2Step,
        addLiquidityStep,
      })

      expect(steps).toEqual([addLiquidityStep])
      expect(addLiquidityStep.nestedSteps).toEqual([...tokenApprovalSteps])
    })
  })

  describe('v3 pools', () => {
    it('permit2 add with enabled signatures', () => {
      const steps = getApprovalAndAddSteps({
        isPermit2: true,
        shouldUseSignatures: true,
        shouldBatchTransactions: false,
        permit2ApprovalSteps,
        tokenApprovalSteps,
        signPermit2Step,
        addLiquidityStep,
      })

      expect(steps).toEqual([...tokenApprovalSteps, signPermit2Step, addLiquidityStep])
    })

    it('permit2 add with disabled signatures', () => {
      const steps = getApprovalAndAddSteps({
        isPermit2: true,
        shouldUseSignatures: false,
        shouldBatchTransactions: false,
        permit2ApprovalSteps,
        tokenApprovalSteps,
        signPermit2Step,
        addLiquidityStep,
      })

      expect(steps).toEqual([...tokenApprovalSteps, ...permit2ApprovalSteps, addLiquidityStep])
    })

    it('permit2 add with Safe tx batch', () => {
      const steps = getApprovalAndAddSteps({
        isPermit2: true,
        shouldUseSignatures: true,
        shouldBatchTransactions: true,
        permit2ApprovalSteps,
        tokenApprovalSteps,
        signPermit2Step,
        addLiquidityStep,
      })

      expect(steps).toEqual([signPermit2Step, addLiquidityStep])
      expect(addLiquidityStep.nestedSteps).toEqual([...tokenApprovalSteps])
    })

    it('permit2 add with Safe tx batch and one of the token approvals completed', () => {
      const pendingTokenApproval = mockTransactionStep('tokenApprovalStep1', false)
      const completedTokenApproval = mockTransactionStep('tokenApprovalStep2', true)
      const tokenApprovalSteps = [pendingTokenApproval, completedTokenApproval]
      const steps = getApprovalAndAddSteps({
        isPermit2: true,
        shouldUseSignatures: true,
        shouldBatchTransactions: true,
        permit2ApprovalSteps,
        tokenApprovalSteps,
        signPermit2Step,
        addLiquidityStep,
      })

      expect(steps).toEqual([signPermit2Step, addLiquidityStep])
      expect(addLiquidityStep.nestedSteps).toEqual(tokenApprovalSteps)
    })

    it('permit2 add with Safe tx batch and all token approvals completed', () => {
      const completedTokenApproval1 = mockTransactionStep('tokenApprovalStep1', true)
      const completedTokenApproval2 = mockTransactionStep('tokenApprovalStep2', true)
      const tokenApprovalSteps = [completedTokenApproval1, completedTokenApproval2]
      const steps = getApprovalAndAddSteps({
        isPermit2: true,
        shouldUseSignatures: true,
        shouldBatchTransactions: true,
        permit2ApprovalSteps,
        tokenApprovalSteps,
        signPermit2Step,
        addLiquidityStep,
      })

      // if all token approvals are completed, there's no need to batch so the are no nested steps
      expect(steps).toEqual([...tokenApprovalSteps, signPermit2Step, addLiquidityStep])
    })

    it('permit2 add with Safe tx batch and disabled signatures', () => {
      const steps = getApprovalAndAddSteps({
        isPermit2: true,
        shouldUseSignatures: false,
        shouldBatchTransactions: true,
        permit2ApprovalSteps,
        tokenApprovalSteps,
        signPermit2Step,
        addLiquidityStep,
      })

      expect(steps).toEqual([addLiquidityStep])
      expect(addLiquidityStep.nestedSteps).toEqual([...tokenApprovalSteps, ...permit2ApprovalSteps])
    })
  })
})
