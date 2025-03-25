import { Text } from '@chakra-ui/react'
import { hasStableSurgeHook } from '@repo/lib/modules/pool/pool.helpers'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { isPoolSurgingError } from '../../utils/error-filters'
import { ensureError } from '../../utils/errors'
import { BalAlertLink } from '../alerts/BalAlertLink'
import { ErrorAlert } from './ErrorAlert'
import { GenericError } from './GenericError'

type Props = {
  priceImpactQuery: {
    isError: boolean
    error: unknown
  }
  simulationQuery: {
    isError: boolean
    error: unknown
  }
  goToProportionalRemoves: () => void
}
export function RemoveSimulationError({
  priceImpactQuery,
  simulationQuery,
  goToProportionalRemoves,
}: Props) {
  const { pool } = usePool()
  if (!simulationQuery.isError && !priceImpactQuery.error) return

  const error = ensureError(simulationQuery.error || priceImpactQuery.error)

  function goToProportionalMode() {
    goToProportionalRemoves()
  }

  if (isPoolSurgingError(error.message, hasStableSurgeHook(pool))) {
    const errorTitle = 'Pool is surging'
    const errorMessage =
      'Single token removes are disabled when a pool with stable surge hook is surging.'
    const goToProportionalLabel = 'Please use proportional remove.'

    return (
      <ErrorAlert title={errorTitle}>
        <Text color="black" variant="secondary">
          {errorMessage}{' '}
          <BalAlertLink onClick={goToProportionalMode}>{goToProportionalLabel}</BalAlertLink>
        </Text>
      </ErrorAlert>
    )
  }

  return <GenericError error={error} />
}
