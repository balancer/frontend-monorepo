import {
  GetPoolsQuery,
  GetPoolsQueryVariables,
  GqlChain,
  GqlPoolType,
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
  GqlNestedPool,
  GetPoolQuery,
} from '@repo/lib/shared/services/api/generated/graphql'
import {
  parseAsArrayOf,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from 'nuqs'
import { Address, Hex } from 'viem'
import { ApiToken } from '../tokens/token.types'

export type Pool = GetPoolQuery['pool']

export type PoolId = Hex

export type PoolList = GetPoolsQuery['pools']

export type PoolListItem = PoolList[0]

type ApiTokenWithNestedPool = ApiToken & { nestedPool?: GqlNestedPool }
export type VotingPool = Pick<
  PoolListItem,
  | 'id'
  | 'address'
  | 'chain'
  | 'type'
  | 'symbol'
  // We need these fields to display boosted underlying tokens in pool token pills (shared by voting, portfolio and standard pool list)
  | 'protocolVersion'
  | 'hasErc4626'
  // We need tags to display erc4626Metadata in PoolListTableDetailsCell
  | 'tags'
  // We need hook to show when the pool has hooks in the voting list
  | 'hook'
> & { poolTokens: ApiTokenWithNestedPool[] }

// PoolCore defines the shared fields between PoolListItem, Pool that are required for pool related shared logic
export type PoolCore = VotingPool | Pool | PoolListItem

export enum BaseVariant {
  v2 = 'v2',
  v3 = 'v3',
}

export type ProtocolVersion = 1 | 2 | 3

// these variants support extra features in project config
export enum PartnerVariant {
  cow = 'cow',
}

export type PoolVariant = BaseVariant | PartnerVariant

export type PoolAction = 'add-liquidity' | 'remove-liquidity' | 'stake' | 'unstake'

export interface FetchPoolProps {
  id: string
  // chain & variant are not used yet, but will be needed in the future.
  chain: GqlChain
  variant?: PoolVariant
}

export interface PoolSearchParams {
  first?: string
  skip?: string
  orderBy?: string
  orderDirection?: string
  poolTypes?: string
  networks?: string
  textSearch?: string
  userAddress?: string
}

export interface PoolsColumnSort {
  id: GqlPoolOrderBy
  desc: boolean
}

export interface PoolsQueryVariables extends GetPoolsQueryVariables {
  first: number
  skip: number
}

export const poolTypeFilters = [
  GqlPoolType.Weighted,
  GqlPoolType.Stable,
  GqlPoolType.LiquidityBootstrapping,
  GqlPoolType.Gyro,
  GqlPoolType.CowAmm,
  GqlPoolType.Fx,
  GqlPoolType.QuantAmmWeighted,
] as const

export type PoolFilterType = (typeof poolTypeFilters)[number]

// We need to map toggalable pool types to their corresponding set of GqlPoolTypes.
export const POOL_TYPE_MAP: { [key in PoolFilterType]: GqlPoolType[] } = {
  [GqlPoolType.Weighted]: [GqlPoolType.Weighted],
  [GqlPoolType.Stable]: [GqlPoolType.Stable, GqlPoolType.ComposableStable, GqlPoolType.MetaStable],
  [GqlPoolType.LiquidityBootstrapping]: [GqlPoolType.LiquidityBootstrapping],
  [GqlPoolType.Gyro]: [GqlPoolType.Gyro, GqlPoolType.Gyro3, GqlPoolType.Gyroe],
  [GqlPoolType.CowAmm]: [GqlPoolType.CowAmm],
  [GqlPoolType.Fx]: [GqlPoolType.Fx],
  [GqlPoolType.QuantAmmWeighted]: [GqlPoolType.QuantAmmWeighted],
}

export const poolTagFilters = ['INCENTIVIZED', 'VE8020', 'POINTS', 'BOOSTED', 'RWA'] as const
export type PoolTagType = (typeof poolTagFilters)[number]

export const poolHookTagFilters = [
  'HOOKS_STABLESURGE',
  'HOOKS_MEVCAPTURE',
  'HOOKS_EXITFEE',
  'HOOKS_FEETAKING',
] as const
export type PoolHookTagType = (typeof poolHookTagFilters)[number]

export type SortingState = PoolsColumnSort[]

export const orderByHash: { [key: string]: string } = {
  totalLiquidity: 'TVL',
  volume24h: 'Volume (24h)',
  apr: 'APR',
  userbalanceUsd: 'My liquidity',
}

export const poolListQueryStateParsers = {
  first: parseAsInteger.withDefault(20),
  skip: parseAsInteger.withDefault(0),
  orderBy: parseAsStringEnum<GqlPoolOrderBy>(Object.values(GqlPoolOrderBy)).withDefault(
    GqlPoolOrderBy.TotalLiquidity
  ),
  orderDirection: parseAsStringEnum<GqlPoolOrderDirection>(
    Object.values(GqlPoolOrderDirection)
  ).withDefault(GqlPoolOrderDirection.Desc),
  poolTypes: parseAsArrayOf(
    parseAsStringEnum<PoolFilterType>(Object.values(poolTypeFilters))
  ).withDefault([]),
  networks: parseAsArrayOf(parseAsStringEnum<GqlChain>(Object.values(GqlChain))).withDefault([]),
  protocolVersion: parseAsInteger,
  textSearch: parseAsString,
  userAddress: parseAsString,
  minTvl: parseAsFloat.withDefault(0),
  poolTags: parseAsArrayOf(
    parseAsStringEnum<PoolTagType>(Object.values(poolTagFilters))
  ).withDefault([]),
  poolHookTags: parseAsArrayOf(
    parseAsStringEnum<PoolHookTagType>(Object.values(poolHookTagFilters))
  ).withDefault([]),
}

/*
  Core token info required for pool actions
  PoolToken and GqlTokens are super sets of TokenCore
*/
export type TokenCore = {
  address: Address
  name: string
  symbol: string
  decimals: number
  index: number
}

export type PoolToken = ApiToken &
  Pool['poolTokens'][0] & {
    nestedPool?: GqlNestedPool
  }

export enum PoolDisplayType {
  Name = 'name',
  TokenPills = 'token-pills',
}
