import { describe, expect, it } from 'vitest'
import { getEip5792ErrorMessage } from './useEip5792BatchSubmitter'

function makeError(code: number): Error {
  const error = new Error('Some RPC error')

  ;(error as Error & { code?: number }).code = code
  return error
}

describe('getEip5792ErrorMessage', () => {
  it('maps error code 5750 to a user-rejected-upgrade message', () => {
    const result = getEip5792ErrorMessage(makeError(5750))

    expect(result.message).toBe(
      'Upgrade rejected. The wallet needs to be upgraded to batch transactions.'
    )
  })

  it('maps error code 5760 to an atomicity-unsupported message', () => {
    const result = getEip5792ErrorMessage(makeError(5760))
    expect(result.message).toBe('Atomic transaction bundling is not supported by this wallet.')
  })

  it('passes through errors with unknown codes unchanged', () => {
    const original = makeError(1234)
    const result = getEip5792ErrorMessage(original)
    expect(result).toBe(original)
    expect(result.message).toBe('Some RPC error')
  })

  it('passes through errors without a code property', () => {
    const original = new Error('Network failure')
    const result = getEip5792ErrorMessage(original)
    expect(result).toBe(original)
  })
})
