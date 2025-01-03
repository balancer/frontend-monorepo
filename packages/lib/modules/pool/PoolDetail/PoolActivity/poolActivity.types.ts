import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { BaseVariant, PoolVariant } from '../../pool.types'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'

export type PoolActivityTokens = {
  token?: ApiToken
  amount: string
}

export type PoolActivityMetaData = {
  userAddress: string
  tokens: PoolActivityTokens[]
  tx: string
  usdValue: string
  action: 'swap' | 'add' | 'remove'
  id: string
}

export type PoolActivityEl = [number, string, PoolActivityMetaData]
export type PoolActivity = Record<'adds' | 'removes' | 'swaps', PoolActivityEl[]>
export type PoolActivityTab = 'all' | 'adds' | 'swaps' | 'removes'

export enum SortingBy {
  time = 'time',
  value = 'value',
  action = 'action',
}

export interface PoolActivityTypeTab {
  value: string
  label: string
}

export enum Sorting {
  asc = 'asc',
  desc = 'desc',
}

export function getPoolActivityTabsList({
  variant,
  poolType,
}: {
  variant: PoolVariant
  poolType: GqlPoolType
}): PoolActivityTypeTab[] {
  const defaultTabs = [
    {
      value: 'adds',
      label: 'Adds',
    },
    {
      value: 'removes',
      label: 'Removes',
    },
  ]
  if (poolType === GqlPoolType.LiquidityBootstrapping && variant === BaseVariant.v2) {
    return defaultTabs
  }

  return [
    {
      value: 'all',
      label: 'All',
    },
    ...defaultTabs,
    {
      value: 'swaps',
      label: 'Swaps',
    },
  ]
}
