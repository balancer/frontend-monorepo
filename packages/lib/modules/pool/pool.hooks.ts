import { getPoolPath } from './pool.utils'
import { Pool } from './pool.types'
import { useParams } from 'next/navigation'
import { PartnerVariant } from '@repo/lib/modules/pool/pool.types'
import { isCowAmmPool } from './pool.helpers'
import { useRedirect } from '@repo/lib/shared/hooks/useRedirect'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function usePoolRedirect(pool: Pool) {
  const path = getPoolPath(pool)

  const { redirectToPage: redirectToPoolPage } = useRedirect(path)

  return { redirectToPoolPage }
}

export function usePoolVariant() {
  const { variant } = useParams<{ variant: PartnerVariant }>()

  const config = PROJECT_CONFIG.variantConfig?.[variant] || {}

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
