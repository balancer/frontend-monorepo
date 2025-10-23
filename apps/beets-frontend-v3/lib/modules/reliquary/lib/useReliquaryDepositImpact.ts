import { useQuery } from '@tanstack/react-query'
import { useReliquary } from '../ReliquaryProvider'

export function useReliquaryDepositImpact(amount: number, relicId?: string) {
  const { getDepositImpact } = useReliquary()

  const depositImpactQuery = useQuery({
    queryKey: ['relicDepositImpact', relicId, amount],
    queryFn: async () => {
      if (Number.isNaN(amount) || !relicId) {
        return
      }
      return await getDepositImpact(amount, relicId)
    },
    enabled: !!relicId && !Number.isNaN(amount),
  })

  return depositImpactQuery
}
