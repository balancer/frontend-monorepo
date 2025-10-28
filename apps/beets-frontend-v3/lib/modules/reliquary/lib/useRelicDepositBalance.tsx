import { useReliquary } from '../ReliquaryProvider'

export function useRelicDepositBalance() {
  const { selectedRelic } = useReliquary()

  // Stub - would normally calculate USD value of deposit
  const relicBalanceUSD = selectedRelic ? parseFloat(selectedRelic.amount) * 1.0 : 0

  return {
    relicBalanceUSD,
  }
}
