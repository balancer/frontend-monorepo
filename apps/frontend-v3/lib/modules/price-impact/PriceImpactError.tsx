import { GenericError } from '@/lib/shared/components/errors/GenericError'
import { isUnhandledAddPriceImpactError } from './price-impact.utils'
import { UseQueryResult } from '@tanstack/react-query'

export function PriceImpactError({
  priceImpactQuery,
}: {
  priceImpactQuery: UseQueryResult<number, Error>
}) {
  if (!priceImpactQuery.error) return null

  if (!isUnhandledAddPriceImpactError(priceImpactQuery.error)) return null

  return (
    <GenericError
      customErrorName={'Error calculating price impact'}
      error={priceImpactQuery.error}
    />
  )
}
