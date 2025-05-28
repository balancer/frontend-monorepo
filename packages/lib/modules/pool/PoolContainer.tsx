'use client'

import { PoolDetail } from './PoolDetail/PoolDetail'
import { usePool } from './PoolProvider'
import { isLBP } from './pool.helpers'
import { LbpDetail } from './LbpDetail/LbpDetail'
import { isDev } from '@repo/lib/config/app.config'

export function PoolContainer() {
  const { pool } = usePool()

  // TODO: only show in dev for now
  if (isLBP(pool.type) && isDev) {
    return <LbpDetail />
  }

  return <PoolDetail />
}
