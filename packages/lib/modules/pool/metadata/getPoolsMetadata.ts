import { mins } from '@repo/lib/shared/utils/time'

const POOLS_METADATA_URL =
  'https://raw.githubusercontent.com/balancer/metadata/main/pools/index.json'

export type PoolMetadata = {
  name?: string
  description?: string
  ignoreERC4626?: boolean
  iconUrl?: string
}

export type PoolsMetadata = {
  [chainId: string]: {
    [address: string]: PoolMetadata
  }
}

export async function getPoolsMetadata(): Promise<PoolsMetadata | undefined> {
  try {
    const res = await fetch(POOLS_METADATA_URL, {
      next: { revalidate: mins(15).toSecs() },
    })

    return (await res.json()) as PoolsMetadata
  } catch (error) {
    console.error('Unable to fetch pools metadata', error)
    return undefined
  }
}
