import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { useShouldBatchTransactions } from '@repo/lib/modules/transactions/transaction-steps/tx-batch.hooks'

export function SettingsAlert() {
  const { shouldUseSignatures, shouldUseTxBundling } = useUserSettings()
  const canBatch = useShouldBatchTransactions()
  const isTxBundlingDisabled = canBatch && !shouldUseTxBundling

  function getTitle() {
    if (isTxBundlingDisabled && !shouldUseSignatures) {
      return 'Transaction bundling and signatures disabled'
    }

    if (isTxBundlingDisabled) return 'Transaction bundling disabled'
    if (!shouldUseSignatures) return 'Signatures disabled'
  }

  function getContent() {
    if (isTxBundlingDisabled && !shouldUseSignatures) {
      return 'You can enable them in your settings.'
    }

    if (isTxBundlingDisabled) {
      return 'For a better user experience, you can enable them in your settings.'
    }

    if (!shouldUseSignatures) {
      return 'All approvals will require gas transactions. You can enable signatures in your settings.'
    }
  }

  if (!shouldUseSignatures || isTxBundlingDisabled) {
    return <BalAlert content={getContent()} status="warning" title={getTitle()} />
  }

  return null
}
