import { NextResponse } from 'next/server'

type Params = {
  params: Promise<{
    address: string
  }>
}

export async function GET(request: Request, { params }: Params) {
  const resolvedParams = await params
  const address = resolvedParams.address

  const hypernativeApiId = process.env.PRIVATE_HYPERNATIVE_API_ID
  const hypernativeApiSecret = process.env.PRIVATE_HYPERNATIVE_API_SECRET
  if (!hypernativeApiId || !hypernativeApiSecret) {
    return NextResponse.json({ error: 'API credentials not configured' }, { status: 500 })
  }

  try {
    const response = await fetch('https://api.hypernative.xyz/v1/address/risk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': hypernativeApiId,
        'x-api-secret': hypernativeApiSecret,
      },
      body: JSON.stringify({
        address,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: 'Error from Hypernative API', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check wallet risk', details: error },
      { status: 500 }
    )
  }
}
