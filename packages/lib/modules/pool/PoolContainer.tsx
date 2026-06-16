'use client'

import { PoolDetail } from './PoolDetail/PoolDetail'
import { usePool } from './PoolProvider'
import { isV3LBP } from './pool.helpers'
import { LbpDetail } from './LbpDetail/LbpDetail'

export function PoolContainer() {
  const { pool } = usePool()

  if (isV3LBP(pool)) return <LbpDetail />

  return <PoolDetail />
}
