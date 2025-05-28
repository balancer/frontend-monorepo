'use client'

import { PoolDetail } from './PoolDetail/PoolDetail'
import { usePool } from './PoolProvider'
import { isLBP } from './pool.helpers'
import { LbpDetail } from './LbpDetail/LbpDetail'

export function PoolContainer() {
  const { pool } = usePool()
  if (isLBP(pool.type)) {
    return <LbpDetail />
  }
  return <PoolDetail />
}
