import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { RelayerMode } from '@repo/lib/modules/relayer/useRelayerMode'
import { getApprovalAndSwapSteps } from './useSwapSteps'

const mockTransactionStep = (id: string, completed = false): TransactionStep =>
  ({
    id,
    isComplete: () => completed,
    nestedSteps: [],
  }) as unknown as TransactionStep

const swapStep = mockTransactionStep('swapStep')
const signPermit2Step = mockTransactionStep('signPermit2Step')
const approveRelayerStep = mockTransactionStep('approveRelayerStep')
const signRelayerStep = mockTransactionStep('signRelayerStep')

const tokenApprovalSteps = [
  mockTransactionStep('tokenApprovalStep1'),
  mockTransactionStep('tokenApprovalStep2'),
]

const permit2ApprovalSteps = [
  mockTransactionStep('permit2ApprovalStep1'),
  mockTransactionStep('permit2ApprovalStep2'),
]

const baseProps = {
  swapRequiresRelayer: false,
  relayerMode: 'no-relayer-needed' as RelayerMode,
  approveRelayerStep,
  signRelayerStep,
  tokenApprovalSteps,
  isPermit2: false,
  signPermit2Step,
  permit2ApprovalSteps,
  shouldUseSignatures: true,
  isNativeTokenIn: false,
  shouldBatchTransactions: false,
  swapStep,
}

describe('getApprovalAndSwapSteps', () => {
  describe('without relayer', () => {
    it('standard swap', () => {
      const steps = getApprovalAndSwapSteps({ ...baseProps })

      expect(steps).toEqual([...tokenApprovalSteps, swapStep])
      expect(swapStep.nestedSteps).toEqual(tokenApprovalSteps)
    })

    it('standard swap with Safe tx batch', () => {
      const steps = getApprovalAndSwapSteps({
        ...baseProps,
        shouldBatchTransactions: true,
      })

      expect(steps).toEqual([swapStep])
      expect(swapStep.nestedSteps).toEqual(tokenApprovalSteps)
    })
  })

  describe('with relayer', () => {
    it('prepends the approve relayer step when in approveRelayer mode', () => {
      const steps = getApprovalAndSwapSteps({
        ...baseProps,
        swapRequiresRelayer: true,
        relayerMode: 'approveRelayer',
      })

      expect(steps).toEqual([approveRelayerStep, ...tokenApprovalSteps, swapStep])
    })

    it('prepends the sign relayer step otherwise', () => {
      const steps = getApprovalAndSwapSteps({
        ...baseProps,
        swapRequiresRelayer: true,
        relayerMode: 'signRelayer',
      })

      expect(steps).toEqual([signRelayerStep, ...tokenApprovalSteps, swapStep])
    })

    it('keeps the relayer step outside the batch', () => {
      const steps = getApprovalAndSwapSteps({
        ...baseProps,
        swapRequiresRelayer: true,
        relayerMode: 'approveRelayer',
        shouldBatchTransactions: true,
      })

      expect(steps).toEqual([approveRelayerStep, swapStep])
      expect(swapStep.nestedSteps).toEqual(tokenApprovalSteps)
    })
  })

  describe('permit2 swaps', () => {
    it('permit2 swap with enabled signatures', () => {
      const steps = getApprovalAndSwapSteps({
        ...baseProps,
        isPermit2: true,
      })

      expect(steps).toEqual([...tokenApprovalSteps, signPermit2Step, swapStep])
    })

    it('permit2 swap with disabled signatures', () => {
      const steps = getApprovalAndSwapSteps({
        ...baseProps,
        isPermit2: true,
        shouldUseSignatures: false,
      })

      expect(steps).toEqual([...tokenApprovalSteps, ...permit2ApprovalSteps, swapStep])
    })

    it('permit2 swap with Safe tx batch and enabled signatures', () => {
      const steps = getApprovalAndSwapSteps({
        ...baseProps,
        isPermit2: true,
        shouldBatchTransactions: true,
      })

      // The permit2 signature stays visible: it is gasless, not part of the tx batch
      expect(steps).toEqual([signPermit2Step, swapStep])
      expect(swapStep.nestedSteps).toEqual(tokenApprovalSteps)
    })

    it('permit2 swap with Safe tx batch and disabled signatures', () => {
      const steps = getApprovalAndSwapSteps({
        ...baseProps,
        isPermit2: true,
        shouldUseSignatures: false,
        shouldBatchTransactions: true,
      })

      expect(steps).toEqual([swapStep])
      expect(swapStep.nestedSteps).toEqual([...tokenApprovalSteps, ...permit2ApprovalSteps])
    })

    it('native tokenIn requires no permit2 signature', () => {
      const steps = getApprovalAndSwapSteps({
        ...baseProps,
        isPermit2: true,
        isNativeTokenIn: true,
        shouldBatchTransactions: true,
      })

      expect(steps).toEqual([swapStep])
      expect(swapStep.nestedSteps).toEqual(tokenApprovalSteps)
    })
  })

  describe('batch edge cases', () => {
    it('does not batch when all approvals are complete', () => {
      const completedTokenApproval1 = mockTransactionStep('tokenApprovalStep1', true)
      const completedTokenApproval2 = mockTransactionStep('tokenApprovalStep2', true)
      const completedApprovals = [completedTokenApproval1, completedTokenApproval2]

      const steps = getApprovalAndSwapSteps({
        ...baseProps,
        tokenApprovalSteps: completedApprovals,
        shouldBatchTransactions: true,
      })

      expect(steps).toEqual([...completedApprovals, swapStep])
      expect(swapStep.nestedSteps).toEqual(completedApprovals)
    })
  })
})
