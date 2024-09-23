'use client'

import { useMandatoryContext } from '@/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'
import { Pool } from '../PoolProvider'
import { PoolCategory } from './getPoolCategories'

export type UsePoolCategoriesResult = ReturnType<typeof _usePoolCategories>
export const PoolCategoriesContext = createContext<UsePoolCategoriesResult | null>(null)

export function _usePoolCategories(categories: PoolCategory[] | undefined) {
  const hasCategories = !!categories

  function getPoolCategories(pool: Pool): PoolCategory[] {
    if (!categories) return []
    return categories.filter(category =>
      pool.tags?.map(tag => tag?.toLowerCase()).includes(category.id)
    )
  }

  function getCategoryIconSrc(category: PoolCategory): string | undefined {
    if (category.id.includes('points')) return '/images/categories/points.svg'
    if (category.id.includes('ve8020')) return '/images/categories/ve8020.svg'

    return undefined
  }

  return { hasCategories, categories, getPoolCategories, getCategoryIconSrc }
}

export function PoolCategoriesProvider({
  children,
  data,
}: PropsWithChildren & { data: PoolCategory[] | undefined }) {
  const hook = _usePoolCategories(data)
  return <PoolCategoriesContext.Provider value={hook}>{children}</PoolCategoriesContext.Provider>
}

export const usePoolCategories = (): UsePoolCategoriesResult =>
  useMandatoryContext(PoolCategoriesContext, 'PoolCategories')
