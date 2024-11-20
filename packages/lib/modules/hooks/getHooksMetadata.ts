import { mins } from '@repo/lib/shared/utils/time'

const HOOKS_METADATA_URL =
  'https://raw.githubusercontent.com/balancer/metadata/refs/heads/main/hooks/index.json'

export type HooksMetadata = {
  id: string
  name: string
  description: string
  addresses: Record<string, string> // chainId -> address
}

export async function getHooksMetadata(): Promise<HooksMetadata[] | undefined> {
  try {
    const res = await fetch(HOOKS_METADATA_URL, {
      next: { revalidate: mins(15).toSecs() },
    })

    return (await res.json()) as HooksMetadata[]
  } catch (error) {
    console.error('Unable to fetch pool hooks metadata', error)
    return undefined
  }
}
