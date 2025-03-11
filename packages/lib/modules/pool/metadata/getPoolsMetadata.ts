import { mins } from '@repo/lib/shared/utils/time'
import { AlertStatus } from '@chakra-ui/react'

const POOLS_METADATA_URL =
  'https://raw.githubusercontent.com/balancer/metadata/main/pools/index.json'

type PoolWarning = {
  text: string
  type: AlertStatus
}

export type PoolMetadata = {
  name?: string
  description?: string
  ignoreERC4626?: boolean
  iconUrl?: string
  warning?: PoolWarning
  addLiquidityWarning?: PoolWarning
  allowAddLiquidity?: boolean
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
