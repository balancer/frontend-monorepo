import { NextResponse } from 'next/server'

export type CoingeckoAssetPlatform = {
  id: string
  chain_identifier: number
}

/**
 * Fetch list of coingecko asset platforms once per day
 */
export async function GET() {
  const res = await fetch('https://api.coingecko.com/api/v3/asset_platforms', {
    next: { revalidate: 86400 },
  })

  const data = await res.json()
  return NextResponse.json(data)
}
