import { type NextRequest, NextResponse } from 'next/server'
import { mins } from '@repo/lib/shared/utils/time'

type FlyApiErrorResponse = {
  error: string
  message?: string
  details?: unknown
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
      const apiKey = process.env.NEXT_PRIVATE_MAGPIE_API_KEY

      if (!apiKey) {
        return NextResponse.json(
          { error: 'NEXT_PRIVATE_MAGPIE_API_KEY is not configured' },
          { status: 500 }
        )
      }

      const searchParams = request.nextUrl.searchParams

      const res = await fetch(`${endpoint}?${searchParams.toString()}`, {
        headers: {
          apikey: apiKey,
        },
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
