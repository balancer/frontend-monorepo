'use client'

import { Link, LinkProps } from '@chakra-ui/react'
import { PoolCore } from './pool.types'
import { getPoolPath } from './pool.utils'

type Props = { pool: PoolCore } & LinkProps

export function PoolLink({ pool, ...props }: Props) {
  return <Link href={getPoolPath(pool)} {...props} />
}
