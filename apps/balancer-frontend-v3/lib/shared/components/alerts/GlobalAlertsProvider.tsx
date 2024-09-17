'use client'

import { useMandatoryContext } from '@/lib/shared/utils/contexts'
import { PropsWithChildren, createContext, useState } from 'react'
import { BalAlertProps } from './BalAlert'

export type GlobalAlertsResponse = ReturnType<typeof _useGlobalAlerts>
export const GlobalAlertsContext = createContext<GlobalAlertsResponse | null>(null)

type GlobalAlert = Pick<BalAlertProps, 'status'> & {
  id: string
  title?: string
  description?: string
}
export function _useGlobalAlerts() {
  const [alerts, setAlerts] = useState<GlobalAlert[]>([])

  function addAlert(alert: GlobalAlert) {
    setAlerts([...alerts, alert])
  }

  function removeAlert(id: string) {
    setAlerts(alerts.filter(a => a.id !== id))
  }

  return {
    alerts,
    addAlert,
    removeAlert,
  }
}

// Controls global alerts in the navigation bar
export function GlobalAlertsProvider({ children }: PropsWithChildren) {
  const hook = _useGlobalAlerts()
  return <GlobalAlertsContext.Provider value={hook}>{children}</GlobalAlertsContext.Provider>
}

export const useGlobalAlerts = (): GlobalAlertsResponse =>
  useMandatoryContext(GlobalAlertsContext, 'GlobalAlerts')
