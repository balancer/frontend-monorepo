import { describe, expect, it } from 'vitest'
import {
  GatewayTransactionDetails,
  TransactionStatus as SafeTransactionStatus,
} from '@safe-global/safe-apps-sdk'
import {
  buildTxBatch,
  getPendingNestedSteps,
  getRemainingSignatures,
  getRemainingSignaturesLabel,
  getSafeWebUrl,
  getSignConfirmationsLabel,
  hasSomePendingNestedTxInBatch,
  isMultisig,
  isSafeTxCancelled,
  isSafeTxRejected,
  isSafeTxSuccess,
  isSafeTxWaitingForConfirmations,
  isSafeTxWaitingForExecution,
  mapSafeTxStatusToBalancerTxState,
  safeStatusToBalancerStatus,
} from './safe.helpers'

const SAFE_ADDRESS = '0x1234567890123456789012345678901234567890'

function multisigDetails(
  confirmations: number,
  confirmationsRequired: number
): GatewayTransactionDetails {
  return {
    detailedExecutionInfo: {
      type: 'MULTISIG',
      confirmations: Array.from({ length: confirmations }, (_, i) => ({ signature: `sig-${i}` })),
      confirmationsRequired,
    },
  } as GatewayTransactionDetails
}

function nonMultisigDetails(): GatewayTransactionDetails {
  return {
    detailedExecutionInfo: { type: 'ETH_SIGN' } as unknown as NonNullable<
      GatewayTransactionDetails['detailedExecutionInfo']
    >,
  } as GatewayTransactionDetails
}

describe('getSafeWebUrl', () => {
  it('builds a safe web url with the chain shortname prefix', () => {
    expect(getSafeWebUrl(1, SAFE_ADDRESS, '0xabc')).toBe(
      `https://app.safe.global/transactions/tx?safe=/eth:${SAFE_ADDRESS}&id=0xabc`
    )
  })

  it('maps every supported chain to its safe shortname', () => {
    expect(getSafeWebUrl(1, SAFE_ADDRESS, 'id')).toContain('eth:')
    expect(getSafeWebUrl(100, SAFE_ADDRESS, 'id')).toContain('gno:')
    expect(getSafeWebUrl(11155111, SAFE_ADDRESS, 'id')).toContain('sep:')
    expect(getSafeWebUrl(42161, SAFE_ADDRESS, 'id')).toContain('arb:')
    expect(getSafeWebUrl(137, SAFE_ADDRESS, 'id')).toContain('matic:')
    expect(getSafeWebUrl(10, SAFE_ADDRESS, 'id')).toContain('oeth:')
    expect(getSafeWebUrl(8453, SAFE_ADDRESS, 'id')).toContain('base:')
    expect(getSafeWebUrl(146, SAFE_ADDRESS, 'id')).toContain('sonic:')
    expect(getSafeWebUrl(43114, SAFE_ADDRESS, 'id')).toContain('avax:')
  })
})

describe('isMultisig', () => {
  it('returns true only for MULTISIG execution details', () => {
    expect(isMultisig(multisigDetails(1, 1))).toBe(true)
    expect(isMultisig(nonMultisigDetails())).toBe(false)
  })
})

describe('getPendingNestedSteps / hasSomePendingNestedTxInBatch', () => {
  const pendingStep = { isComplete: () => false }
  const completedStep = { isComplete: () => true }

  it('filters out completed nested steps', () => {
    const step = { nestedSteps: [pendingStep, completedStep] } as any
    expect(getPendingNestedSteps(step)).toHaveLength(1)
  })

  it('returns true when any nested step is pending', () => {
    const step = { nestedSteps: [pendingStep, completedStep] } as any
    expect(hasSomePendingNestedTxInBatch(step)).toBe(true)
  })

  it('returns false when all nested steps are complete or absent', () => {
    expect(hasSomePendingNestedTxInBatch({ nestedSteps: [completedStep] } as any)).toBe(false)
    expect(hasSomePendingNestedTxInBatch({} as any)).toBe(false)
  })
})

describe('getSignConfirmationsLabel / getRemainingSignatures / getRemainingSignaturesLabel', () => {
  it('returns null and 0 for non-multisig details', () => {
    expect(getSignConfirmationsLabel(nonMultisigDetails())).toBeNull()
    expect(getRemainingSignatures(nonMultisigDetails())).toBe(0)
    expect(getRemainingSignaturesLabel(nonMultisigDetails())).toBeUndefined()
  })

  it('formats the confirmations label', () => {
    expect(getSignConfirmationsLabel(multisigDetails(2, 3))).toBe('Signatures: 2 out of 3')
  })

  it('computes remaining signatures and their labels', () => {
    expect(getRemainingSignatures(multisigDetails(2, 3))).toBe(1)
    expect(getRemainingSignaturesLabel(multisigDetails(2, 3))).toBe('(1 more signature required)')
    expect(getRemainingSignaturesLabel(multisigDetails(1, 3))).toBe(
      '2 more signatures are required'
    )
    expect(getRemainingSignaturesLabel(multisigDetails(3, 3))).toBeUndefined()
  })
})

describe('buildTxBatch', () => {
  it('builds a single-element batch when there are no nested steps', () => {
    const step = { batchableTxCall: { to: '0xaaa', value: 1n } } as any
    expect(buildTxBatch(step)).toEqual([{ to: '0xaaa', value: '1' }])
  })

  it('serializes value to a string, defaulting to 0', () => {
    const step = { batchableTxCall: { to: '0xaaa' } } as any
    expect(buildTxBatch(step)).toEqual([{ to: '0xaaa', value: '0' }])
  })

  it('prepends pending nested step calls and always appends the parent call', () => {
    const step = {
      nestedSteps: [
        { isComplete: () => false, batchableTxCall: { to: '0xbbb' } },
        { isComplete: () => true, batchableTxCall: { to: '0xccc' } },
      ],
      batchableTxCall: { to: '0xaaa' },
    } as any
    expect(buildTxBatch(step)).toEqual([
      { to: '0xbbb', value: '0' },
      { to: '0xaaa', value: '0' },
    ])
  })
})

describe('safe tx status predicates', () => {
  it('detects success', () => {
    expect(isSafeTxSuccess(SafeTransactionStatus.SUCCESS)).toBe(true)
    expect(isSafeTxSuccess(SafeTransactionStatus.FAILED)).toBe(false)
  })

  it('detects cancellation', () => {
    expect(isSafeTxCancelled(SafeTransactionStatus.CANCELLED)).toBe(true)
    expect(isSafeTxCancelled(SafeTransactionStatus.FAILED)).toBe(false)
  })

  it('detects waiting states', () => {
    expect(isSafeTxWaitingForExecution(SafeTransactionStatus.AWAITING_EXECUTION)).toBe(true)
    expect(isSafeTxWaitingForConfirmations(SafeTransactionStatus.AWAITING_CONFIRMATIONS)).toBe(true)
  })

  it('treats failed transactions as rejected', () => {
    expect(isSafeTxRejected(SafeTransactionStatus.FAILED)).toBe(true)
    expect(isSafeTxRejected(SafeTransactionStatus.CANCELLED)).toBe(true)
    expect(isSafeTxRejected(SafeTransactionStatus.SUCCESS)).toBe(false)
  })
})

describe('safeStatusToBalancerStatus', () => {
  it('maps each safe status to the balancer transaction status', () => {
    expect(safeStatusToBalancerStatus(SafeTransactionStatus.AWAITING_CONFIRMATIONS)).toBe(
      'confirming'
    )
    expect(safeStatusToBalancerStatus(SafeTransactionStatus.AWAITING_EXECUTION)).toBe('confirming')
    expect(safeStatusToBalancerStatus(SafeTransactionStatus.CANCELLED)).toBe('rejected')
    expect(safeStatusToBalancerStatus(SafeTransactionStatus.FAILED)).toBe('reverted')
    expect(safeStatusToBalancerStatus(SafeTransactionStatus.SUCCESS)).toBe('confirmed')
    expect(safeStatusToBalancerStatus(undefined)).toBe('unknown')
  })
})

describe('mapSafeTxStatusToBalancerTxState', () => {
  it('maps to transaction states', () => {
    expect(mapSafeTxStatusToBalancerTxState(undefined)).toBe('init')
    expect(mapSafeTxStatusToBalancerTxState(SafeTransactionStatus.SUCCESS)).toBe('completed')
    expect(mapSafeTxStatusToBalancerTxState(SafeTransactionStatus.CANCELLED)).toBe('error')
    expect(mapSafeTxStatusToBalancerTxState(SafeTransactionStatus.FAILED)).toBe('error')
    expect(mapSafeTxStatusToBalancerTxState(SafeTransactionStatus.AWAITING_EXECUTION)).toBe('init')
  })
})
