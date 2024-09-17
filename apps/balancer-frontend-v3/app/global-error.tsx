'use client'

import * as Sentry from '@sentry/nextjs'
import { default as NextError } from 'next/error'
import { useEffect } from 'react'
import { isDev, isStaging } from '@/lib/config/app.config'

/**
 * Global Next.js ErrorBoundary (!) Next components are not available
 *
 * Catches:
 * - ssr errors (e.g. fetch) (production only)
 * - root layout errors (production only)
 * - navigation error (e.g. throw from rendering component during next navigation)
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-global-errors
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const showResetButton = isDev || isStaging
  const href = typeof window === 'undefined' ? undefined : window.location.href

  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  const title = error.digest ? `Something went wrong (${error.digest})` : 'Something went wrong'

  return (
    <html>
      <body>
        <NextError statusCode={500} title={title} />
        <div style={{ marginTop: '16px' }}>
          {href && (
            <a href={window.location.href}>
              <button>Reload Page</button>
            </a>
          )}
          {showResetButton && <button onClick={() => reset?.()}>Try Reset (dev)</button>}
        </div>
      </body>
    </html>
  )
}
