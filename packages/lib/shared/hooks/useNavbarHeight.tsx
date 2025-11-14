'use client'

import { usePathname } from 'next/navigation'
import { useApiHealth } from './useApiHealth'
import { isBalancer } from '@repo/lib/config/getProjectConfig'

const BASE_NAVBAR_HEIGHT = 72
const ALERT_HEIGHT = 48

/**
 * Hook to calculate the total navbar height including any alerts
 * This is used to properly offset page content when alerts are displayed
 */
export function useNavbarHeight() {
  const { apiOK } = useApiHealth()
  const pathname = usePathname()

  // Check if we should show the v2 exploit alert
  const poolActions = ['add-liquidity', 'remove-liquidity', 'stake', 'unstake', 'swap']
  const shouldShowV2Exploit = isBalancer && poolActions.every(action => !pathname.includes(action))

  let totalHeight = BASE_NAVBAR_HEIGHT

  // Add height for API outage alert
  if (!apiOK) {
    totalHeight += ALERT_HEIGHT
  }

  // Add height for v2 exploit alert
  if (shouldShowV2Exploit) {
    totalHeight += ALERT_HEIGHT
  }

  return totalHeight
}
