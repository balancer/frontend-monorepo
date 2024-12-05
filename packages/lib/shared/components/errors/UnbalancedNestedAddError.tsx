import { ErrorAlert } from './ErrorAlert'
import { AlertProps, Text } from '@chakra-ui/react'
import { BalAlertLink } from '../alerts/BalAlertLink'
import { getProjectConfig } from '@repo/lib/config/getProjectConfig'

type Props = AlertProps & {
  error: Error
  isProportionalSupported?: boolean
}

export function UnbalancedNestedAddError({ error }: Props) {
  console.log('Nested pool add error: ', error)

  /*
    Possible errors include:

    - MaxRatio error due to add liquidity amounts being too unbalanced
    - MaxRatio error due to add liquidity amounts being too large
    - MinRatio error due to removeLiquidity amounts being too unbalanced
    - MinRatio error due to removeLiquidity amounts being too large
    - Pi calculation error (several possible reasons, but most often happens with near proportional amounts)
    - Query tx reverted due arithmetic overflow

    We can't always differentiate between these errors, so we'll show a generic message until we have more info/ user feedback.
  */
  return (
    <ErrorAlert title="Unbalanced amounts">
      <Text color="black" variant="secondary">
        Your input(s) are either too large or would excessively unbalance the pool, please try
        smaller/more proportional amounts or report the issue in{' '}
        <BalAlertLink href={getProjectConfig().externalLinks.discordUrl}>our discord</BalAlertLink>.
      </Text>
    </ErrorAlert>
  )
}
