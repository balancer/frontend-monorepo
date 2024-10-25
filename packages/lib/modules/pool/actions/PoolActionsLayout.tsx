'use client'

import { PropsWithChildren } from 'react'
import { usePool } from '../PoolProvider'
import { PoolName } from '../PoolName'
import { getPoolPath } from '@repo/lib/modules/pool/pool.utils'
import { FocussedActionLayout } from '@repo/lib/shared/components/layout/FocussedActionLayout'

type Props = PropsWithChildren

export function PoolActionsLayout({ children }: Props) {
  const { pool } = usePool()

  return (
    <FocussedActionLayout
      chain={pool.chain}
      leftSlot={<PoolName color="font.light" pool={pool} />}
      redirectPath={getPoolPath(pool)}
    >
      {children}
    </FocussedActionLayout>
  )
}
