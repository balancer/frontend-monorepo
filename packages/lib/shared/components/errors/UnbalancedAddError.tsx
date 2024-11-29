'use client'

import { AlertProps, Text } from '@chakra-ui/react'
import { isUnbalancedAddError } from '../../utils/error-filters'
import { BalAlertLink } from '../alerts/BalAlertLink'
import { ErrorAlert } from './ErrorAlert'

type Props = AlertProps & {
  error?: Error | null
  goToProportionalAdds: () => void
}

export function UnbalancedAddError({ error, goToProportionalAdds }: Props) {
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
