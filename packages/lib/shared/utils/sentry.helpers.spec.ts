import { ErrorEvent } from '@sentry/core'
import { shouldIgnoreException } from './sentry.helpers'

describe('shouldIgnoreError', () => {
  it('Ignores errors', () => {
    expect(
      shouldIgnoreException(createSentryException('e.getAccounts is not a function'))
    ).toBeTruthy()
    expect(shouldIgnoreException(createSentryException('foo bar baz'))).toBeFalsy()
  })

  it('when error does not have message', () => {
    expect(shouldIgnoreException(createSentryException(''))).toBeFalsy()
  })
})

function createSentryException(errorMessage: string) {
  return {
    exception: { values: [{ type: 'Error', value: errorMessage }] },
  } as ErrorEvent
}
