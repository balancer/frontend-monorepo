'use client'

import { AlertProps, Text } from '@chakra-ui/react'
import {
  isInvariantRatioAboveMaxSimulationErrorMessage,
  isInvariantRatioAboveMinSimulationErrorMessage,
  isInvariantRatioPIErrorMessage,
  isUnbalancedAddError,
  isUnbalancedAddErrorMessage,
  isPoolSurgingError,
} from '../../utils/error-filters'
import { BalAlertLink } from '../alerts/BalAlertLink'
import { ErrorAlert } from './ErrorAlert'
import { useAddLiquidity } from '@repo/lib/modules/pool/actions/add-liquidity/AddLiquidityProvider'
import { Pool } from '@repo/lib/modules/pool/pool.types'
import { hasStableSurgeHook } from '@repo/lib/modules/pool/pool.helpers'

type Props = AlertProps & {
  error: Error
  goToProportionalAdds: () => void
  isProportionalSupported?: boolean
  pool: Pool
}

export function UnbalancedAddError({
  error,
  goToProportionalAdds,
  isProportionalSupported = true,
  pool,
}: Props) {
  const { clearAmountsIn } = useAddLiquidity()
  const goToProportionalMode = () => {
    clearAmountsIn()
    goToProportionalAdds()
  }

  if (!isUnbalancedAddError(error, pool)) return null

  const errorLabels = getErrorLabels(isProportionalSupported, error, pool)

  if (!errorLabels) return null

  return (
    <ErrorAlert title={errorLabels.errorTitle}>
      <Text color="black" variant="secondary">
        {errorLabels.errorMessage}{' '}
        {isProportionalSupported ? (
          <BalAlertLink onClick={goToProportionalMode}>
            {errorLabels.proportionalLabel}
          </BalAlertLink>
        ) : (
          errorLabels.proportionalLabel
        )}
      </Text>
    </ErrorAlert>
  )
}

export type UnbalancedErrorLabels = {
  errorTitle: string
  errorMessage: string
  proportionalLabel: string
}

export function getErrorLabels(
  isProportionalSupported: boolean,
  error: Error,
  pool?: Pool
): UnbalancedErrorLabels | undefined {
  if (!error) return
  let errorTitle = 'Token amounts error'
  let errorMessage = 'Unexpected error. Please ask for support'
  let proportionalLabel = 'Please use proportional mode.'

  if (isInvariantRatioAboveMaxSimulationErrorMessage(error.message)) {
    errorTitle = 'Amount exceeds pool limits'
    errorMessage = 'Your input(s) would cause an invariant error in the vault.'
  } else if (isPoolSurgingError(error.message, !!pool && hasStableSurgeHook(pool))) {
    errorTitle = 'Pool is surging'
    errorMessage = 'Flexible adds are disabled when a pool with stable surge hook is surging.'
  } else if (isInvariantRatioAboveMinSimulationErrorMessage(error.message)) {
    errorTitle = 'Amount is below pool limits'
  } else if (isInvariantRatioPIErrorMessage(error.message)) {
    errorTitle = 'Unknown price impact'
    errorMessage = isProportionalSupported
      ? 'The price impact cannot be calculated. Proceed if you know exactly what you are doing or'
      : 'The price impact cannot be calculated. Proceed if you know exactly what you are doing.'
    proportionalLabel = 'try proportional mode.'
  } else if (isUnbalancedAddErrorMessage(error)) {
    errorMessage = 'Your input(s) are either too large or would excessively unbalance the pool.'
  }

  if (!isProportionalSupported) {
    proportionalLabel = 'Please try different amounts.'
  }

  return {
    errorTitle,
    errorMessage,
    proportionalLabel,
  }
}
