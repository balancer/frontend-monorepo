'use client'

import { Link, LinkProps } from '@chakra-ui/react'
import { getPoolPath } from './pool.utils'
import { PoolListItem } from './pool.types'
import { Pool } from './PoolProvider'

type Props = { pool: Pool | PoolListItem } & LinkProps

export function PoolLink({ pool, ...props }: Props) {
  return <Link href={getPoolPath(pool)} {...props} />
}
