import { describe, it, expect } from 'vitest'
import { getErrorLabels } from './UnbalancedAddError'

describe('getErrorLabels', () => {
  const invariantRatioAboveMaxError = new Error('InvariantRatioAboveMax')
  const invariantRatioAboveMinError = new Error('InvariantRatioBelowMin')
  const invariantRatioPIError = new Error(
    'addLiquidityUnbalanced operation will fail at SC level with user defined input.'
  )
  const unbalancedAddErrorV2 = new Error('BAL#304')
  const unbalancedAddErrorV3 = new Error('queryAddLiquidityUnbalanced')

  it('should return correct labels for isInvariantRatioAboveMaxSimulationErrorMessage', () => {
    const result = getErrorLabels(true, invariantRatioAboveMaxError)
    expect(result).toEqual({
      errorTitle: 'Amount exceeds pool limits',
      errorMessage: 'Your input(s) would cause an invariant error in the vault.',
      proportionalLabel: 'Please use proportional mode.',
    })
  })

  it('should return correct labels for isInvariantRatioAboveMinSimulationErrorMessage', () => {
    const result = getErrorLabels(true, invariantRatioAboveMinError)
    expect(result).toEqual({
      errorTitle: 'Amount is below pool limits',
      errorMessage: 'Unexpected error. Please ask for support',
      proportionalLabel: 'Please use proportional mode.',
    })
  })

  it('should return correct labels for isInvariantRatioPIErrorMessage when proportional is supported', () => {
    const result = getErrorLabels(true, invariantRatioPIError)
    expect(result).toEqual({
      errorTitle: 'Unknown price impact',
      errorMessage:
        'The price impact cannot be calculated. Proceed if you know exactly what you are doing or',
      proportionalLabel: 'try proportional mode.',
    })
  })

  it('should return correct labels for isInvariantRatioPIErrorMessage when proportional is not supported', () => {
    const result = getErrorLabels(false, invariantRatioPIError)
    expect(result).toEqual({
      errorTitle: 'Unknown price impact',
      errorMessage:
        'The price impact cannot be calculated. Proceed if you know exactly what you are doing.',
      proportionalLabel: 'Please try different amounts.',
    })
  })

  it('should return correct labels for isUnbalancedAddErrorMessage (v2)', () => {
    const result = getErrorLabels(true, unbalancedAddErrorV2)
    expect(result).toEqual({
      errorTitle: 'Token amounts error',
      errorMessage: 'Your input(s) are either too large or would excessively unbalance the pool.',
      proportionalLabel: 'Please use proportional mode.',
    })
  })

  it('should return correct labels for isUnbalancedAddErrorMessage (v3)', () => {
    const result = getErrorLabels(true, unbalancedAddErrorV3)
    expect(result).toEqual({
      errorTitle: 'Token amounts error',
      errorMessage: 'Your input(s) are either too large or would excessively unbalance the pool.',
      proportionalLabel: 'Please use proportional mode.',
    })
  })
})
