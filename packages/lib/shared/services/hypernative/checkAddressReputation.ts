import { NextResponse } from 'next/server'
import { captureError, ensureError } from '../../utils/errors'
import { hours } from '../../utils/time'

type ReputationResponse = {
  data: Array<{ flags: string[]; address: string; recommendation: string }>
}

type Params = {
  address: string
  hypernativeApiId: string
  hypernativeApiSecret: string
}

/*
  To be called from wallet-check nextjs API route (by balancer and beets apps)

  Policy id - 8a7dfb26-8b50-416b-811e-77f3dede2319
  created by hypernative  based on their understanding of the required rules (OFAC + Related to OFAC up to 3 hops away)

  Hypernative reputation docs:
  https://docs.hypernative.xyz/hypernative-product-docs/developers/hypernative-api/screener/address-reputation/get-address-reputation-1
*/
export async function checkAddressReputation({
  address,
  hypernativeApiId,
  hypernativeApiSecret,
}: Params) {
  try {
    const res = await fetch('https://api.hypernative.xyz/screener/reputation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': hypernativeApiId,
        'x-client-secret': hypernativeApiSecret,
      },
      body: JSON.stringify({
        addresses: [address],
        screenerPolicyId: '8a7dfb26-8b50-416b-811e-77f3dede2319',
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
