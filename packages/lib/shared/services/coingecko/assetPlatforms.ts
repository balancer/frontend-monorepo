import { NextResponse } from 'next/server'
import { twentyFourHoursInSecs } from '../../utils/time'

export type CoingeckoAssetPlatform = {
  id: string
  chain_identifier: number
}

/**
 * Fetch list of coingecko asset platforms once per day and cache the data for all users
 */
export async function handleCoingeckoAssetPlatformsRequest() {
  const res = await fetch('https://api.coingecko.com/api/v3/asset_platforms', {
    next: { revalidate: twentyFourHoursInSecs },
  })

  const data: CoingeckoAssetPlatform[] = await res.json()

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, s-maxage=${twentyFourHoursInSecs}, stale-while-revalidate=${twentyFourHoursInSecs}`,
    },
  })
}
