import { describe, expect, test } from 'vitest'
import { parseSwapReceipt } from './receipt-parsers'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

describe('parseSwapReceipt', () => {
  test('does not crash when userAddress is undefined', () => {
    // Regression: getIncomingWithdrawals returned [] (truthy) when userAddress
    // was undefined, which bypassed the || 0n guard and caused bn([]) to throw
    // under BigNumber STRICT mode.
    const result = parseSwapReceipt({
      receiptLogs: [],
      userAddress: undefined,
      chain: GqlChain.Mainnet,
      getToken: () => undefined,
      txValue: 0n,
      protocolVersion: 2,
    })

    expect(result.sentToken.humanAmount).toBe('0')
    expect(result.receivedToken.humanAmount).toBe('0')
  })
})
