import { mins } from '@repo/lib/shared/utils/time'

const POOL_TAGS_URL =
  'https://raw.githubusercontent.com/balancer/metadata/main/pools/tags/index.json'

const POOL_TAGS_ICON_BASE_URL =
  'https://raw.githubusercontent.com/balancer/metadata/main/pools/tags/icons'

export type PoolTag = {
  id: string
  name: string
  description: string
  value?: string
  url?: string
  fileIcon?: string
  iconUrl?: string
  pools?: string[]
}

export async function getPoolTags(): Promise<PoolTag[] | undefined> {
  try {
    const res = await fetch(POOL_TAGS_URL, {
      next: { revalidate: mins(15).toSecs() },
    })
    const tags = (await res.json()) as PoolTag[]

    return tags.map(tag => {
      return {
        ...tag,
        iconUrl: tag.fileIcon ? `${POOL_TAGS_ICON_BASE_URL}/${tag.fileIcon}` : undefined,
      }
    })
  } catch (error) {
    console.error('Unable to fetch pool tags', error)
    return undefined
  }
}
