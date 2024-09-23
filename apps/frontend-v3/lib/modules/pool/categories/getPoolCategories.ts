import { mins } from '@/lib/shared/utils/time'

const POOL_CATEGORIES_URL =
  'https://raw.githubusercontent.com/balancer/metadata/main/pools/categories/index.json'

const POOL_CATEGORY_ICON_BASE_URL =
  'https://raw.githubusercontent.com/balancer/metadata/main/pools/categories/icons'

export type PoolCategory = {
  id: string
  name: string
  description: string
  value?: string
  url?: string
  fileIcon?: string
  iconUrl?: string
}

export async function getPoolCategories(): Promise<PoolCategory[] | undefined> {
  try {
    const res = await fetch(POOL_CATEGORIES_URL, {
      next: { revalidate: mins(15).toSecs() },
    })
    const categories = (await res.json()) as PoolCategory[]

    return categories.map(category => {
      return {
        ...category,
        iconUrl: category.fileIcon
          ? `${POOL_CATEGORY_ICON_BASE_URL}/${category.fileIcon}`
          : undefined,
      }
    })
  } catch (error) {
    console.error('Unable to fetch pool categories', error)
    return undefined
  }
}
