import { mins } from '@repo/lib/shared/utils/time'

const POOL_MIGRATIONS_URL =
  'https://raw.githubusercontent.com/balancer/metadata/main/pools/migration.json'

export type PoolInfo = {
  protocol: number
  chainId: number
  id: string
}

export type PoolMigration = {
  old: PoolInfo
  new: PoolInfo
}

export async function getPoolMigrations(): Promise<PoolMigration[]> {
  try {
    const res = await fetch(POOL_MIGRATIONS_URL, {
      next: { revalidate: mins(5).toSecs() },
    })

    return (await res.json()) as PoolMigration[]
  } catch (error) {
    console.error('Unable to fetch pool migrations', error)
    return []
  }
}
