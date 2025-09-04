import { validatePoolTokens, validatePoolType } from './validatePoolCreationForm'
import { usePoolCreationForm } from './PoolCreationFormProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'

export function InvalidTotalWeightAlert() {
  const { poolTokens, poolType } = usePoolCreationForm()

  const isTotalWeightTooLow = validatePoolTokens.isTotalWeightTooLow(poolTokens)
  const isTotalWeightTooHigh = validatePoolTokens.isTotalWeightTooHigh(poolTokens)
  const isWeightedPool = validatePoolType.isWeightedPool(poolType)

  if (!isWeightedPool) return null

  if (isTotalWeightTooLow)
    return (
      <BalAlert
        content="To create a weighted pool, the sum of all the weights of the tokens must tally exactly 100%"
        status="warning"
        title="Token weights must tally 100%"
      />
    )

  if (isTotalWeightTooHigh)
    return (
      <BalAlert
        content="To create a weighted pool, the sum of all the weights of the tokens must tally exactly 100%"
        status="error"
        title="Token weights must tally 100%"
      />
    )
}
