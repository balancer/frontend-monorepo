'use client'

import { AlertProps, Text } from '@chakra-ui/react'
import { isUnbalancedAddError } from '../../utils/error-filters'
import { BalAlertLink } from '../alerts/BalAlertLink'
import { ErrorAlert } from './ErrorAlert'

type Props = AlertProps & {
  error?: Error | null
}

export function UnbalancedAddError({ error }: Props) {
  function goToProportionalAdds() {
    // TODO: implement when we have the add tabs (unbalanced and proportional).
    console.log('Go to proportional adds')
  }

  if (isUnbalancedAddError(error)) {
    return (
      <ErrorAlert title="Unbalanced error">
        <Text color="black" variant="secondary">
          Your input(s) would excessively unbalance the pool.{' '}
          <BalAlertLink onClick={goToProportionalAdds}>Please use proportional mode.</BalAlertLink>
        </Text>
      </ErrorAlert>
    )
  }

  return null
}
