import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'

export function SettingsAlert() {
  const { shouldUseSignatures, shouldUseTxBundling } = useUserSettings()

  function getTitle() {
    if (!shouldUseTxBundling && !shouldUseSignatures) {
      return 'Transaction bundling and signatures disabled'
    }
    if (!shouldUseTxBundling) return 'Transaction bundling disabled'
    if (!shouldUseSignatures) return 'Signatures disabled'
  }
  function getContent() {
    if (!shouldUseTxBundling && !shouldUseSignatures) {
      return 'You can enable them in your settings.'
    }
    if (!shouldUseTxBundling) return 'You can enable them in your settings.'
    if (!shouldUseSignatures) {
      return 'All approvals will require gas transactions. You can enable signatures in your settings.'
    }
  }
  if (!shouldUseSignatures || !shouldUseTxBundling) {
    return <BalAlert content={getContent()} status="warning" title={getTitle()} />
  }
  return null
}
