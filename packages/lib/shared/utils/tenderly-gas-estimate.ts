import type { NextRequest } from 'next/server'

export interface TenderlyConfig {
  accountSlug: string | undefined
  projectSlug: string | undefined
  accessKey: string | undefined
}

export interface GasEstimateRequest {
  from: string
  to: string
  input: string
  value?: string
  chainId: number
}

export interface GasEstimateResponse {
  gasUsed: number | undefined
  error?: string
}

export function getTenderlyConfig(): TenderlyConfig {
  return {
    accountSlug: process.env.NEXT_PRIVATE_TENDERLY_ACCOUNT_SLUG,
    projectSlug: process.env.NEXT_PRIVATE_TENDERLY_PROJECT_SLUG,
    accessKey: process.env.NEXT_PRIVATE_TENDERLY_ACCESS_KEY,
  }
}

export function getAllowedOrigins(): string[] {
  return [
    ...(process.env.NEXT_PRIVATE_ALLOWED_ORIGINS || '').split(','),
    process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : '',
  ].filter(Boolean)
}

export function isAllowedOrigin(request: NextRequest, allowedOrigins: string[]): boolean {
  const referer = request.headers.get('referer')
  return !!(referer && allowedOrigins.some(origin => referer.startsWith(origin)))
}

export function validateTenderlyConfig(config: TenderlyConfig): boolean {
  return !!(config.accountSlug && config.projectSlug && config.accessKey)
}

export function validateRequestBody(body: any): body is GasEstimateRequest {
  return !!(body.from && body.to && body.input && body.chainId)
}

export async function getGasEstimateSimulation(
  config: TenderlyConfig,
  request: GasEstimateRequest
): Promise<GasEstimateResponse> {
  if (!validateTenderlyConfig(config)) {
    return { gasUsed: undefined, error: 'Tenderly configuration is missing' }
  }

  try {
    const response = await fetch(
      `https://api.tenderly.co/api/v1/account/${config.accountSlug}/project/${config.projectSlug}/simulate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': config.accessKey!,
        },
        body: JSON.stringify({
          from: request.from,
          to: request.to,
          input: request.input,
          value: request.value || '0',
          gas: 8000000,
          gas_price: 0,
          estimate_gas: true,
          simulation_type: 'quick',
          network_id: request.chainId.toString(),
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return {
        gasUsed: undefined,
        error: errorData.message || 'Tenderly simulation failed',
      }
    }

    const data = await response.json()
    return { gasUsed: data.transaction.gas_used }
  } catch {
    return {
      gasUsed: undefined,
      error: 'Internal server error',
    }
  }
}

export function createForbiddenResponse(): Response {
  return new Response(
    JSON.stringify({
      error: 'Forbidden: Access denied',
      code: -32000,
      message: 'Access denied',
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

export function createBadRequestResponse(message: string): Response {
  return new Response(JSON.stringify({ error: message }), { status: 400 })
}
