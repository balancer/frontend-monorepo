/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/navigation'
import { getPoolPath } from './pool.utils'
import { Pool } from './PoolProvider'
import { useParams } from 'next/navigation'
import { PartnerVariant } from '@/lib/modules/pool/pool.types'
import { getProjectConfig } from '@/lib/config/getProjectConfig'
import { isCowAmmPool } from './pool.helpers'

export function usePoolRedirect(pool: Pool) {
  const router = useRouter()

  /**
   * Redirects user to pool page and respects ctrl/cmd clicks to open in new tab.
   */
  function redirectToPoolPage(event?: React.MouseEvent<HTMLElement>) {
    const path = getPoolPath(pool)

    if (event && (event.ctrlKey || event.metaKey)) {
      window.open(path, '_blank')
    } else {
      router.push(path)
    }
  }
  return { redirectToPoolPage }
}

export function getVariantConfig(variant: PartnerVariant) {
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
