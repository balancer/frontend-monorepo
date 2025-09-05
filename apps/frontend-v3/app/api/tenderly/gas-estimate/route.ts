import type { NextRequest } from 'next/server'

const TENDERLY_ACCOUNT_SLUG = process.env.NEXT_PRIVATE_TENDERLY_ACCOUNT_SLUG
const TENDERLY_PROJECT_SLUG = process.env.NEXT_PRIVATE_TENDERLY_PROJECT_SLUG
const TENDERLY_ACCESS_KEY = process.env.NEXT_PRIVATE_TENDERLY_ACCESS_KEY

const ALLOWED_ORIGINS = [
  ...(process.env.NEXT_PRIVATE_ALLOWED_ORIGINS || '').split(','),
  process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : '',
].filter(Boolean)

export async function POST(request: NextRequest) {
  const referer = request.headers.get('referer')
  const isAllowedOrigin = referer && ALLOWED_ORIGINS.some(origin => referer.startsWith(origin))

  if (!isAllowedOrigin) {
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

  if (!TENDERLY_ACCOUNT_SLUG || !TENDERLY_PROJECT_SLUG || !TENDERLY_ACCESS_KEY) {
    return new Response(JSON.stringify({ error: 'Tenderly configuration is missing' }), {
      status: 500,
    })
  }

  try {
    const body = await request.json()
    const { from, to, input, value, chainId } = body

    if (!from || !to || !input || !chainId) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400 })
    }

    const response = await fetch(
      `https://api.tenderly.co/api/v1/account/${TENDERLY_ACCOUNT_SLUG}/project/${TENDERLY_PROJECT_SLUG}/simulate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': TENDERLY_ACCESS_KEY,
        },
        body: JSON.stringify({
          from,
          to,
          input,
          value: value || '0',
          gas: 8000000,
          gas_price: 0,
          estimate_gas: true,
          simulation_type: 'quick',
          network_id: chainId.toString(),
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return new Response(
        JSON.stringify({ error: errorData.message || 'Tenderly simulation failed' }),
        { status: response.status }
      )
    }

    const data = await response.json()

    return Response.json({
      gasUsed: data.transaction.gas_used,
    })
  } catch (error) {
    console.error('Error in tenderly gas estimate:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
