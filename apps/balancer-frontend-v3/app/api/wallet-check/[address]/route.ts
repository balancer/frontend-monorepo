import { captureError, ensureError } from '@/lib/shared/utils/errors'
import { hours } from '@/lib/shared/utils/time'
import { NextResponse } from 'next/server'

type Params = {
  params: {
    address: string
  }
}

type ReputationResponse = {
  data: Array<{ flags: string[]; address: string; recommendation: string }>
}

export async function GET(request: Request, { params: { address } }: Params) {
  try {
    if (!process.env.PRIVATE_HYPERNATIVE_API_ID || !process.env.PRIVATE_HYPERNATIVE_API_SECRET) {
      return NextResponse.json({ isAuthorized: true })
    }

    const res = await fetch('https://api.hypernative.xyz/assets/reputation/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.PRIVATE_HYPERNATIVE_API_ID,
        'x-client-secret': process.env.PRIVATE_HYPERNATIVE_API_SECRET,
      },
      body: JSON.stringify({
        addresses: [address],
        flagIds: ['F-1101', 'F-1111', 'F-1301', 'F-1302'],
        expandDetails: true,
      }),
      next: {
        revalidate: hours(12).toSecs(),
      },
    })

    if (!res.ok) {
      throw new Error('Failed to fetch reputation. Response status: ' + res.status)
    }

    const response: ReputationResponse = await res.json()
    const recommendation = response.data[0]?.recommendation
    if (!recommendation) {
      throw new Error('Invalid reputation response: ' + JSON.stringify(response.data))
    }

    const isAuthorized = recommendation !== 'Deny'

    return NextResponse.json({ isAuthorized })
  } catch (err) {
    const error = ensureError(err)

    captureError(error, { extra: { address } })

    return NextResponse.json({ isAuthorized: true })
  }
}
