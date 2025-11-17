'use client'

import { PropsWithChildren } from 'react'
import { usePool } from '../PoolProvider'
import { PoolName } from '../PoolName'
import { getPoolPath } from '@repo/lib/modules/pool/pool.utils'
import { FocussedActionLayout } from '@repo/lib/shared/components/layout/FocussedActionLayout'

type Props = PropsWithChildren & {
  redirectPath?: string
}

export function PoolActionsLayout({ children, redirectPath }: Props) {
  const { pool } = usePool()

  const finalRedirectPath = redirectPath ?? getPoolPath(pool)

  return (
    <FocussedActionLayout
      chain={pool.chain}
      leftSlot={<PoolName color="font.light" pool={pool} />}
      redirectPath={finalRedirectPath}
    >
      {children}
    </FocussedActionLayout>
  )
}
