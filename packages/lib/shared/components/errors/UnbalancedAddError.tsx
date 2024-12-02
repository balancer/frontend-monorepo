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
  error?: Error | null
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

  if (isUnbalancedAddError(error)) {
    return (
      <ErrorAlert title={getErrorTitle(error)}>
        <Text color="black" variant="secondary">
          {getErrorMessage(isProportionalSupported, error)}{' '}
          {isProportionalSupported ? (
            <BalAlertLink onClick={goToProportionalMode}>
              {getUseProportionalLabel(isProportionalSupported, error)}
            </BalAlertLink>
          ) : (
            getUseProportionalLabel(isProportionalSupported, error)
          )}
        </Text>
      </ErrorAlert>
    )
  }

  return null
}

// TODO: Improve these error messages
function getErrorTitle(error?: Error | null) {
  if (isInvariantRatioAboveMaxSimulationErrorMessage(error?.message)) {
    return 'Amount exceeds pool limits'
  }
  if (isInvariantRatioAboveMinSimulationErrorMessage(error?.message)) {
    return 'Amount is below pool limits'
  }

  if (isInvariantRatioPIErrorMessage(error?.message)) return 'Unknown price impact'
  return 'Token amounts error'
}

function getErrorMessage(isProportionalSupported: boolean, error?: Error | null) {
  if (!error) return 'Unexpected error.'

  if (isInvariantRatioAboveMaxSimulationErrorMessage(error?.message)) {
    return 'Your input(s) would cause an invariant error in the vault.'
  }
  if (isInvariantRatioPIErrorMessage(error?.message)) {
    if (!isProportionalSupported) {
      return 'The price impact cannot be calculated. Proceed if you know exactly what you are doing.'
    }
    return 'The price impact cannot be calculated. Proceed if you know exactly what you are doing or'
  }
  if (isUnbalancedAddErrorMessage(error)) {
    return 'Your input(s) would excessively unbalance the pool.'
  }
  return 'Unexpected error. Please ask for support'
}

function getUseProportionalLabel(isProportionalSupported: boolean, error?: Error | null) {
  if (!isProportionalSupported) return 'Please try different amounts.'
  if (isInvariantRatioPIErrorMessage(error?.message)) {
    return 'try proportional mode.'
  }
  return 'Please use proportional mode.'
}
