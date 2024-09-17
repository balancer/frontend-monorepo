'use client'

import { load, trackPageview } from 'fathom-client'
import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { isProd } from '@/lib/config/app.config'

export enum AnalyticsEvent {
  ClickAddLiquidity = 'click: Add liquidity',
  TransactionSubmitted = 'transaction: Submitted',
  TransactionConfirmed = 'transaction: Confirmed',
  TransactionReverted = 'transaction: Reverted',
}

/**
 * Track Fathom events
 * https://usefathom.com/docs/events/overview
 *
 * @param event The event key
 * @param value Optional value to track, should be in cents (e.g. 1000 for $10)
 */
export function trackEvent(event: AnalyticsEvent, value?: number) {
  if (!window.fathom) return
  try {
    window.fathom.trackEvent(event, { _value: value })
  } catch (error) {
    console.error('Failed to track event', event, error)
  }
}

function TrackPageView() {
  // Current Path
  const pathname = usePathname()
  // Current query params
  const searchParams = useSearchParams()

  // Load the Fathom script on mount
  useEffect(() => {
    // Optional: Only track on production; remove these two lines if you want to track other environments
    if (!isProd) return

    load('MKFEFCXC', {
      auto: false,
      // Optional but I like to explicitly choose the domains to track:
      includedDomains: ['balancer.fi', 'zen.balancer.fi'],
    })
  }, [])

  // Record a pageview when route changes
  useEffect(() => {
    if (!pathname) return

    trackPageview({
      url: pathname + searchParams.toString(),
      referrer: document.referrer,
    })
  }, [pathname, searchParams]) // Track page views if path or params change

  return null
}

// We use this in our main layout.tsx or jsx file
export function Fathom() {
  return (
    <Suspense fallback={null}>
      <TrackPageView />
    </Suspense>
  )
}
