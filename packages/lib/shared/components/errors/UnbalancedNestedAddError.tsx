import { ErrorAlert } from './ErrorAlert'
import { AlertProps, Text } from '@chakra-ui/react'
import { BalAlertLink } from '../alerts/BalAlertLink'

type Props = AlertProps & {
  error: Error
  isProportionalSupported?: boolean
}

export function UnbalancedNestedAddError({ error }: Props) {
  console.log('Nested pool add error: ', error)

  return (
    <ErrorAlert title="Unbalanced amounts">
      <Text color="black" variant="secondary">
        Your input(s) would excessively unbalance the pool. Please try more proportional amounts or
        report the issue in{' '}
        <BalAlertLink href="https://discord.balancer.fi/">our discord</BalAlertLink>.
      </Text>
    </ErrorAlert>
  )
}
