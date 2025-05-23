'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'
import { Pool } from '../pool.types'
import { PoolTag } from './getPoolTags'

export type UsePoolTagsResult = ReturnType<typeof usePoolTagsLogic>
export const PoolTagsContext = createContext<UsePoolTagsResult | null>(null)

export function usePoolTagsLogic(tags: PoolTag[] | undefined) {
  const hasTags = !!tags

  function getPoolTags(pool: Pool): PoolTag[] {
    if (!tags) return []
    return tags.filter(
      _tag => pool.tags?.map(tag => tag?.toLowerCase()).includes(_tag.id) && _tag.id !== 'points' // remove 'points' tag as that is only used on the pool list page
    )
  }

  function getTagIconSrc(category: PoolTag): string | undefined {
    if (category.id.includes('points')) return '/images/categories/points.svg'
    if (category.id.includes('ve8020')) return '/images/categories/ve8020.svg'

    return undefined
  }

  return { hasTags, tags, getPoolTags, getTagIconSrc }
}

export function PoolTagsProvider({
  children,
  data,
}: PropsWithChildren & { data: PoolTag[] | undefined }) {
  const hook = usePoolTagsLogic(data)
  return <PoolTagsContext.Provider value={hook}>{children}</PoolTagsContext.Provider>
}

export const usePoolTags = (): UsePoolTagsResult => useMandatoryContext(PoolTagsContext, 'PoolTags')
