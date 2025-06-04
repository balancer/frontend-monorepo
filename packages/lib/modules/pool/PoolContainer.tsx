'use client'

import { PoolDetail } from './PoolDetail/PoolDetail'
import { usePool } from './PoolProvider'
import { isLBP } from './pool.helpers'
import { LbpDetail } from './LbpDetail/LbpDetail'
import { isDev, isStaging } from '@repo/lib/config/app.config'
import { isV3Pool } from './pool.helpers'

export function PoolContainer() {
  const { pool } = usePool()

  // TODO: only show in dev/staging for now
  if (isV3Pool(pool) && isLBP(pool.type) && (isDev || isStaging)) {
    return <LbpDetail />
  }

  return <PoolDetail />
}
