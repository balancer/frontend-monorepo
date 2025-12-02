import { validatePoolTokens } from './validatePoolCreationForm'
import { usePoolCreationForm } from './PoolCreationFormProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { isWeightedPool } from './helpers'
import { useWatch } from 'react-hook-form'

export function InvalidTotalWeightAlert() {
  const { poolCreationForm } = usePoolCreationForm()
  const [poolTokens, poolType] = useWatch({
    control: poolCreationForm.control,
    name: ['poolTokens', 'poolType'],
  })

  const isTotalWeightTooLow = validatePoolTokens.isTotalWeightTooLow(poolTokens)
  const isTotalWeightTooHigh = validatePoolTokens.isTotalWeightTooHigh(poolTokens)

  if (!isWeightedPool(poolType)) return null

  if (isTotalWeightTooLow || isTotalWeightTooHigh) {
    return (
      <BalAlert
        content="To create a weighted pool, the sum of all the weights of the tokens must tally exactly 100%"
        status={isTotalWeightTooLow ? 'warning' : 'error'}
        title="Token weights must tally 100%"
      />
    )
  }
}
