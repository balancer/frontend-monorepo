'use client'

import { PropsWithChildren } from 'react'
import { usePool } from '../PoolProvider'
import { PoolName } from '../PoolName'
import { getPoolPath } from '@repo/lib/modules/pool/pool.utils'
import { ModalActionsLayout } from '@repo/lib/shared/components/layout/ModalActionsLayout'

type Props = PropsWithChildren

export function PoolActionsLayout({ children }: Props) {
  const { pool } = usePool()

  return (
    <ModalActionsLayout
      leftSlot={<PoolName pool={pool} color="font.light" />}
      redirectPath={getPoolPath(pool)}
      chain={pool.chain}
    >
      {children}
    </ModalActionsLayout>
  )
}
