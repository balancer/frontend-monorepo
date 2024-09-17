'use client'

import { BalAlert } from '../alerts/BalAlert'
import { BalAlertContent } from '../alerts/BalAlertContent'
import { useGlobalAlerts } from '../alerts/GlobalAlertsProvider'

// Displays global alerts in the navigation bar
export function GlobalAlerts() {
  const { alerts, removeAlert } = useGlobalAlerts()
  const lastAlert = alerts[alerts.length - 1]
  if (!lastAlert) return null
  return (
    <BalAlert
      content={<BalAlertContent {...lastAlert} />}
      isNavAlert
      isSoftWarning
      onClose={() => removeAlert(lastAlert.id)}
      status={lastAlert.status}
    />
  )
}
