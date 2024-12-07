'use client'

import { AlertProps, Text } from '@chakra-ui/react'
import {
  isInvariantRatioAboveMaxSimulationErrorMessage,
  isInvariantRatioAboveMinSimulationErrorMessage,
  isInvariantRatioPIErrorMessage,
  isUnbalancedAddError,
  isUnbalancedAddErrorMessage,
} from '../../utils/error-filters'
import { BalAlertLink } from '../alerts/BalAlertLink'
import { ErrorAlert } from './ErrorAlert'
import { useAddLiquidity } from '@repo/lib/modules/pool/actions/add-liquidity/AddLiquidityProvider'

type Props = AlertProps & {
  error: Error
  goToProportionalAdds: () => void
  isProportionalSupported?: boolean
}

export function UnbalancedAddError({
  error,
  goToProportionalAdds,
  isProportionalSupported = true,
}: Props) {
  const { clearAmountsIn } = useAddLiquidity()
  const goToProportionalMode = () => {
    clearAmountsIn()
    goToProportionalAdds()
  }

  if (!isUnbalancedAddError(error)) return null

  const errorLabels = getErrorLabels(isProportionalSupported, error)

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
  error: Error
): UnbalancedErrorLabels | undefined {
  if (!error) return
  let errorTitle = 'Token amounts error'
  let errorMessage = 'Unexpected error. Please ask for support'
  let proportionalLabel = 'Please use proportional mode.'

  if (isInvariantRatioAboveMaxSimulationErrorMessage(error.message)) {
    errorTitle = 'Amount exceeds pool limits'
    errorMessage = 'Your input(s) would cause an invariant error in the vault.'
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
