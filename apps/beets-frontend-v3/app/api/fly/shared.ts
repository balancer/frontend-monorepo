import { type NextRequest, NextResponse } from 'next/server'
import { isProd } from '@repo/lib/config/app.config'
import { mins } from '@repo/lib/shared/utils/time'
import { isAllowedReferer } from '../shared/referer'

type FlyApiErrorResponse = {
  error: string
  message?: string
  details?: unknown
  code?: number
}

type CreateFlyGetHandlerOptions = {
  endpoint: string
  invalidResponseMessage: string
  failureResponseMessage: string
  logContext: string
}

function hasError(response: unknown): response is { error?: unknown } {
  return typeof response === 'object' && response !== null && 'error' in response
}

export function createFlyGetHandler<T>({
  endpoint,
  invalidResponseMessage,
  failureResponseMessage,
  logContext,
}: CreateFlyGetHandlerOptions) {
  return async function handle(
    request: NextRequest
  ): Promise<NextResponse<T | FlyApiErrorResponse>> {
    try {
      if (!isAllowedReferer(request.headers.get('referer'))) {
        return NextResponse.json(
          {
            error: 'Forbidden: Access denied',
            code: -32000,
            message: 'Access denied',
          },
          { status: 403 }
        )
      }

      const apiKey = process.env.NEXT_PRIVATE_MAGPIE_API_KEY

      if (!isProd && !apiKey) {
        return NextResponse.json(
          { error: 'NEXT_PRIVATE_MAGPIE_API_KEY is not configured' },
          { status: 500 }
        )
      }

      const searchParams = request.nextUrl.searchParams

      const res = await fetch(`${endpoint}?${searchParams.toString()}`, {
        headers: apiKey ? { apikey: apiKey } : undefined,
        next: { revalidate: mins(1).toSecs() },
      })

      if (!res.ok) {
        throw new Error(`Magpie API returned ${res.status}: ${res.statusText}`)
      }

      const result = (await res.json()) as T | { error?: unknown }

      if (hasError(result) && result.error) {
        return NextResponse.json(
          { error: invalidResponseMessage, details: result },
          { status: 400 }
        )
      }

      return NextResponse.json(result as T)
    } catch (error) {
      console.error(`${logContext}:`, error)
      return NextResponse.json(
        {
          error: failureResponseMessage,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  }
}
