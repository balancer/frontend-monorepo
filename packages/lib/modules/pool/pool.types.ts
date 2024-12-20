import {
  GetPoolsQuery,
  GetPoolsQueryVariables,
  GqlChain,
  GqlPoolType,
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
  GetTokensQuery,
} from '@repo/lib/shared/services/api/generated/graphql'
import {
  parseAsArrayOf,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from 'nuqs'
import { Address, Hex } from 'viem'

export type PoolId = Hex

export type PoolList = GetPoolsQuery['pools']

export type PoolListItem = PoolList[0]

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
}

export const poolTagFilters = ['INCENTIVIZED', 'VE8020', 'POINTS', 'BOOSTED'] as const
export type PoolTagType = (typeof poolTagFilters)[number]
export const POOL_TAG_MAP: { [key in PoolTagType]: string[] } = {
  INCENTIVIZED: ['INCENTIVIZED'],
  POINTS: [
    'POINTS_EIGENLAYER',
    'POINTS_GYRO',
    'POINTS_KELP',
    'POINTS_RENZO',
    'POINTS_SWELL',
    'POINTS_MODE',
  ],
  VE8020: ['VE8020'],
  BOOSTED: ['BOOSTED'],
}

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

export type ApiToken = Omit<GetTokensQuery['tokens'][0], '__typename'> & {
  nestedTokens?: ApiToken[]
  underlyingToken?: ApiToken
  weight?: string
}

export enum PoolListDisplayType {
  Name = 'name',
  TokenPills = 'token-pills',
}
