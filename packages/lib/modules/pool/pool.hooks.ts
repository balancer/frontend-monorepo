/* eslint-disable react-hooks/exhaustive-deps */
import { getPoolPath } from './pool.utils'
import { Pool } from './PoolProvider'
import { useParams } from 'next/navigation'
import { PartnerVariant } from '@repo/lib/modules/pool/pool.types'
import { getProjectConfig } from '@repo/lib/config/getProjectConfig'
import { isCowAmmPool } from './pool.helpers'
import { useRedirect } from '@repo/lib/shared/hooks/useRedirect'
import { Banners } from '@repo/lib/config/config.types'

export function usePoolRedirect(pool: Pool) {
  const path = getPoolPath(pool)

  const { redirectToPage: redirectToPoolPage } = useRedirect(path)

  return { redirectToPoolPage }
}

export function getVariantConfig(variant: PartnerVariant): { banners?: Banners } {
  const { variantConfig } = getProjectConfig()
  return variantConfig?.[variant] || {}
}

export function usePoolVariant() {
  const { variant } = useParams<{ variant: PartnerVariant }>()

  const config = getVariantConfig(variant)

  return {
    variant,
    ...config,
  }
}

// Redirects to pool detail page if the pool variant in the url does not match with the actual pool type.
export function useInvalidVariantRedirect(pool: Pool) {
  const { redirectToPoolPage } = usePoolRedirect(pool)
  const { variant } = usePoolVariant()

  if (!isCowAmmPool(pool.type) && variant === PartnerVariant.cow) {
    redirectToPoolPage()
  }
}
