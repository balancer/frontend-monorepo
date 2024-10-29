'use client'

import { useParams, usePathname } from 'next/navigation'
import { PartnerVariant, PoolVariant } from '../pool/pool.types'

export function useCow() {
  const { variant } = useParams<{ variant?: PoolVariant }>()
  const pathname = usePathname()

  const isCowPath = pathname.split('/').includes('cow')
  const isCowVariant = variant === PartnerVariant.cow

  return {
    isCowPath,
    isCowVariant,
  }
}
