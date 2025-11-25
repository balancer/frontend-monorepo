'use client'

import { PoolDetail } from './PoolDetail/PoolDetail'
import { usePool } from './PoolProvider'
import { isV3LBP } from './pool.helpers'
import { LbpDetail } from './LbpDetail/LbpDetail'
import { isBalancer } from '@repo/lib/config/getProjectConfig'

export function PoolContainer() {
  const { pool } = usePool()

  if (isBalancer && isV3LBP(pool)) return <LbpDetail />

  return <PoolDetail />
}
