'use client'

import { AlertProps, Text } from '@chakra-ui/react'
import { ErrorAlert } from './ErrorAlert'
import {
  isLedgerUnknownError,
  isNotEnoughGasError,
  isPausedError,
  isTooManyRequestsError,
  isUserRejectedError,
  isViemHttpFetchError,
} from '../../utils/error-filters'
import { ensureError } from '../../utils/errors'
import { BalAlertLink } from '../alerts/BalAlertLink'
import { getDiscordLink } from '../../utils/links'

export type ErrorWithOptionalShortMessage = Error & { shortMessage?: string }

type Props = AlertProps & {
  error: ErrorWithOptionalShortMessage
  customErrorName?: string
  skipError?: boolean
}

export function GenericError({ error: _error, customErrorName, skipError, ...rest }: Props) {
  const discordUrl = getDiscordLink()

  if (skipError) return
  const error = ensureError(_error)
  if (isUserRejectedError(error)) return null
  const errorName = customErrorName ? `${customErrorName} (${error.name})` : error.name

  if (isViemHttpFetchError(_error)) {
    return (
      <ErrorAlert title={customErrorName} {...rest}>
        <Text color="black" variant="secondary">
          It looks like there was a network issue. Check your connection and try again. You can
          report the problem in <BalAlertLink href={discordUrl}>our discord</BalAlertLink> if the
          issue persists.
        </Text>
      </ErrorAlert>
    )
  }

  if (isLedgerUnknownError(_error)) {
    return (
      <ErrorAlert title={customErrorName} {...rest}>
        <Text color="black" variant="secondary">
          There was an issue related with your Ledger and wallet connection setup. Make sure that
          your Ledger is updated. We also recommend trying with more modern wallets that work better
          with Ledger. You can report the problem in{' '}
          <BalAlertLink href={discordUrl}>our discord</BalAlertLink> if the issue persists.
        </Text>
      </ErrorAlert>
    )
  }

  if (isPausedError(_error)) {
    return (
      <ErrorAlert title={customErrorName} {...rest}>
        <Text color="black" variant="secondary">
          The pool or one of the pool tokens is paused. Check{' '}
          <BalAlertLink href={discordUrl}>our discord</BalAlertLink> for more information.
        </Text>
      </ErrorAlert>
    )
  }

  if (isTooManyRequestsError(_error)) {
    return (
      <ErrorAlert title={customErrorName} {...rest}>
        <Text color="black" variant="secondary">
          Too many RPC requests. Please try again in some minutes. You can report the problem in{' '}
          <BalAlertLink href={discordUrl}>our discord</BalAlertLink> if the issue persists.
        </Text>
      </ErrorAlert>
    )
  }

  if (isNotEnoughGasError(_error)) {
    return (
      <ErrorAlert title={customErrorName} {...rest}>
        <Text color="black" variant="secondary">
          It looks like you don&apos;t have enough gas to complete this transaction. If you believe
          this is a mistake, please report it in{' '}
          <BalAlertLink href={discordUrl}>our discord.</BalAlertLink>
        </Text>
      </ErrorAlert>
    )
  }

  const errorMessage = error?.shortMessage || error.message

  if (errorMessage === 'RPC Request failed.' || errorMessage === 'An unknown RPC error occurred.') {
    return (
      <ErrorAlert title={errorMessage} {...rest}>
        <Text color="black" variant="secondary">
          It looks like there was an RPC Request issue. You can report the problem in{' '}
          <BalAlertLink href={discordUrl}>our discord</BalAlertLink> if the issue persists.
        </Text>
      </ErrorAlert>
    )
  }

  return (
    <ErrorAlert title={errorName} {...rest}>
      <Text color="black" variant="secondary">
        Error details: {errorMessage}
      </Text>
    </ErrorAlert>
  )
}
