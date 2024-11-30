'use client'

import { AlertProps, Text } from '@chakra-ui/react'
import {
  isInvariantRatioPIErrorMessage,
  isInvariantRatioSimulationErrorMessage,
  isUnbalancedAddError,
  isUnbalancedAddErrorMessage,
} from '../../utils/error-filters'
import { BalAlertLink } from '../alerts/BalAlertLink'
import { ErrorAlert } from './ErrorAlert'
import { useAddLiquidity } from '@repo/lib/modules/pool/actions/add-liquidity/AddLiquidityProvider'

type Props = AlertProps & {
  error?: Error | null
  goToProportionalAdds: () => void
}

export function UnbalancedAddError({ error, goToProportionalAdds }: Props) {
  const { clearAmountsIn } = useAddLiquidity()
  const goToProportionalMode = () => {
    clearAmountsIn()
    goToProportionalAdds()
  }

  if (isUnbalancedAddError(error)) {
    return (
      <ErrorAlert title={getErrorTitle(error)}>
        <Text color="black" variant="secondary">
          {getErrorMessage(error)}{' '}
          <BalAlertLink onClick={goToProportionalMode}>
            {getUseProportionalLabel(error)}
          </BalAlertLink>
        </Text>
      </ErrorAlert>
    )
  }

  return null
}

// TODO: Improve these error messages
function getErrorTitle(error?: Error | null) {
  if (isInvariantRatioPIErrorMessage(error?.message)) return 'Unknown price impact'
  return 'Token amounts error'
}

function getErrorMessage(error?: Error | null) {
  if (!error) return 'Unexpected error.'
  if (isUnbalancedAddErrorMessage(error)) {
    return 'Your input(s) would excessively unbalance the pool.'
  }
  if (isInvariantRatioSimulationErrorMessage(error?.message)) {
    return 'Your input(s) would cause an invariant error in the vault'
  }
  if (isInvariantRatioPIErrorMessage(error?.message)) {
    return 'The price impact cannot be calculated. Proceed if you know exactly what you are doing or'
  }
  return 'Unexpected error. Please ask for support'
}

function getUseProportionalLabel(error?: Error | null) {
  if (isInvariantRatioPIErrorMessage(error?.message)) return 'try proportional mode.'
  return 'Please use proportional mode.'
}
