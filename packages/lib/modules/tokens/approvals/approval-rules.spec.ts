import { SupportedChainId } from '@repo/lib/config/config.types'
import { usdtAddress, wETHAddress, wjAuraAddress } from '@repo/lib/debug-helpers'
import { MAX_BIGINT } from '@repo/lib/shared/utils/numbers'
import { testRawAmount } from '@repo/lib/test/utils/numbers'
import { RawAmount, getRequiredTokenApprovals, isTheApprovedAmountEnough } from './approval-rules'

const chainId: SupportedChainId = 1

const rawAmounts: RawAmount[] = [
  {
    address: wETHAddress,
    rawAmount: testRawAmount('10'),
  },
  {
    address: wjAuraAddress,
    rawAmount: testRawAmount('20'),
  },
]

function allowanceFor(): bigint {
  return MAX_BIGINT
}

describe('getRequiredTokenApprovals', () => {
  test('when skipAllowanceCheck', () => {
    expect(
      getRequiredTokenApprovals({
        chainId,
        rawAmounts,
        allowanceFor,
        skipAllowanceCheck: true,
      })
    ).toEqual([])
  })

  test('when empty amounts to approve', () => {
    expect(
      getRequiredTokenApprovals({
        chainId,
        rawAmounts: [],
        allowanceFor,
      })
    ).toEqual([])
  })

  test('when all the amounts to approve are greater than zero', () => {
    expect(
      getRequiredTokenApprovals({
        rawAmounts,
        chainId,
        allowanceFor,
      })
    ).toEqual([
      {
        isPermit2: false,
        tokenAddress: wETHAddress,
        requiredRawAmount: 10000000000000000000n,
        requestedRawAmount: MAX_BIGINT,
        symbol: 'Unknown',
      },
      {
        isPermit2: false,
        tokenAddress: wjAuraAddress,
        requiredRawAmount: 20000000000000000000n,
        requestedRawAmount: MAX_BIGINT,
        symbol: 'Unknown',
      },
    ])
  })

  test('when one token (USDT) requires double token approval', () => {
    function allowanceFor(): bigint {
      return 5n
    }

    const rawAmounts: RawAmount[] = [
      {
        address: usdtAddress,
        rawAmount: testRawAmount('10'),
      },
    ]

    expect(
      getRequiredTokenApprovals({
        rawAmounts,
        chainId,
        allowanceFor,
      })
    ).toEqual([
      {
        requiredRawAmount: 0n,
        requestedRawAmount: 0n,
        tokenAddress: usdtAddress,
        isPermit2: false,
        symbol: 'Unknown',
      },
      {
        tokenAddress: usdtAddress,
        requiredRawAmount: 10000000000000000000n,
        requestedRawAmount: MAX_BIGINT,
        isPermit2: false,
        symbol: 'Unknown',
      },
    ])
  })

  test('when one token (USDT) requires double token approval but it does not have current allowance', () => {
    function allowanceFor(): bigint {
      return 0n
    }

    const rawAmounts: RawAmount[] = [
      {
        address: usdtAddress,
        rawAmount: testRawAmount('10'),
      },
    ]

    expect(
      getRequiredTokenApprovals({
        rawAmounts,
        chainId,
        allowanceFor,
      })
    ).toEqual([
      {
        isPermit2: false,
        requiredRawAmount: 10000000000000000000n,
        requestedRawAmount: MAX_BIGINT,
        tokenAddress: usdtAddress,
        symbol: 'Unknown',
      },
    ])
  })
})

describe('Approved amounts', () => {
  it('should be false when no required amount', () => {
    const tokenAllowance = testRawAmount('10')
    const requiredAmount = testRawAmount('0')
    const doubleApproval = false

    const result = isTheApprovedAmountEnough(tokenAllowance, requiredAmount, doubleApproval)

    expect(result).toBe(false)
  })

  it('should be false when approved less than required', () => {
    const tokenAllowance = testRawAmount('10')
    const requiredAmount = testRawAmount('20')
    const doubleApproval = false

    const result = isTheApprovedAmountEnough(tokenAllowance, requiredAmount, doubleApproval)

    expect(result).toBe(false)
  })

  it('should be true when enough amount approved', () => {
    const tokenAllowance = testRawAmount('30')
    const requiredAmount = testRawAmount('20')
    const doubleApproval = false

    const result = isTheApprovedAmountEnough(tokenAllowance, requiredAmount, doubleApproval)

    expect(result).toBe(true)
  })

  it('[EDGE CASE] should be true when USDT and no amount is approved', () => {
    const tokenAllowance = testRawAmount('0')
    const requiredAmount = testRawAmount('10')
    const doubleApproval = true
    const nextToken = {
      isPermit2: false,
      tokenAddress: wETHAddress,
      requiredRawAmount: testRawAmount('10'),
      requestedRawAmount: testRawAmount('10'),
      symbol: 'Unknown',
    }

    const result = isTheApprovedAmountEnough(
      tokenAllowance,
      requiredAmount,
      doubleApproval,
      nextToken
    )

    expect(result).toBe(true)
  })

  it('[EDGE CASE] should be true when USDT and enough amount approved', () => {
    const tokenAllowance = testRawAmount('20')
    const requiredAmount = testRawAmount('0')
    const doubleApproval = true
    const nextToken = {
      isPermit2: false,
      tokenAddress: wETHAddress,
      requiredRawAmount: testRawAmount('10'),
      requestedRawAmount: testRawAmount('10'),
      symbol: 'Unknown',
    }

    const result = isTheApprovedAmountEnough(
      tokenAllowance,
      requiredAmount,
      doubleApproval,
      nextToken
    )

    expect(result).toBe(true)
  })

  it('[EDGE CASE] should be false when USDT and not enough amount approved', () => {
    const tokenAllowance = testRawAmount('20')
    const requiredAmount = testRawAmount('0')
    const doubleApproval = true
    const nextToken = {
      isPermit2: false,
      tokenAddress: wETHAddress,
      requiredRawAmount: testRawAmount('30'),
      requestedRawAmount: testRawAmount('30'),
      symbol: 'Unknown',
    }

    const result = isTheApprovedAmountEnough(
      tokenAllowance,
      requiredAmount,
      doubleApproval,
      nextToken
    )

    expect(result).toBe(false)
  })
})
