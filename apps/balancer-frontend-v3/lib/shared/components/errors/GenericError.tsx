'use client'

import { AlertProps, Text } from '@chakra-ui/react'
import { ErrorAlert } from './ErrorAlert'
import { isUserRejectedError, isViemHttpFetchError } from '../../utils/error-filters'
import { ensureError } from '../../utils/errors'
import { BalAlertLink } from '../alerts/BalAlertLink'

type ErrorWithOptionalShortMessage = Error & { shortMessage?: string }
type Props = AlertProps & {
  error: ErrorWithOptionalShortMessage
  customErrorName?: string
}

export function GenericError({ error: _error, customErrorName, ...rest }: Props) {
  const error = ensureError(_error)
  if (isUserRejectedError(error)) return null
  const errorName = customErrorName ? `${customErrorName} (${error.name})` : error.name
  if (isViemHttpFetchError(_error)) {
    return (
      <ErrorAlert title={customErrorName} {...rest}>
        <Text color="black" variant="secondary">
          It looks like there was a network issue. Check your connection and try again. You can
          report the problem in{' '}
          <BalAlertLink href="https://discord.balancer.fi/">our discord</BalAlertLink> if the issue
          persists.
        </Text>
      </ErrorAlert>
    )
  }
  const errorMessage = error?.shortMessage || error.message
  return (
    <ErrorAlert title={errorName} {...rest}>
      <Text color="black" variant="secondary">
        Error details: {errorMessage}
      </Text>
    </ErrorAlert>
  )
}
