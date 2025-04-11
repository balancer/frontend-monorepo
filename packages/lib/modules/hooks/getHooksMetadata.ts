import { mins } from '@repo/lib/shared/utils/time'

const HOOKS_METADATA_URL =
  'https://raw.githubusercontent.com/balancer/metadata/refs/heads/main/hooks/index.json'

export type HooksMetadata = {
  id: string
  name: string
  description: string
  learnMore?: string
  addresses: Record<string, string[]> // chainId -> addresses[]
}

export async function getHooksMetadata(): Promise<HooksMetadata[] | undefined> {
  try {
    const res = await fetch(HOOKS_METADATA_URL, {
      next: { revalidate: mins(15).toSecs() },
    })

    const metadata = (await res.json()) as HooksMetadata[]

    // lowercase addresses to match API address format
    return _lowerCaseAddresses(metadata)
  } catch (error) {
    console.error('Unable to fetch pool hooks metadata', error)
    return undefined
  }
}

export function _lowerCaseAddresses(metadata: HooksMetadata[]) {
  return metadata.map(hook => ({
    ...hook,
    addresses: Object.fromEntries(
      Object.entries(hook.addresses).map(([chainId, addresses]) => [
        chainId,
        addresses.map(address => address.toLowerCase()),
      ])
    ),
  }))
}
