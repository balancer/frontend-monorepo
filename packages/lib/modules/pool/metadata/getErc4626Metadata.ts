import { mins } from '@repo/lib/shared/utils/time'

const ERC4626_METADATA_URL =
  'https://raw.githubusercontent.com/balancer/metadata/main/erc4626/index.json'

const ERC4626_METADATA_ICON_BASE_URL =
  'https://raw.githubusercontent.com/balancer/metadata/main/erc4626/icons'

const ERC4626_METADATA_KEEP_ORIGINAL_SCALE_URL =
  'https://raw.githubusercontent.com/balancer/metadata/main/erc4626/keep-original-scale.json'

export type Erc4626Metadata = {
  id: string
  name: string
  description: string
  icon: string
  iconUrl?: string
  addresses: {
    [key: string]: string[]
  }
}

export type Erc4626KeepOriginalScale = {
  [chainId: string]: string[]
}

export async function getErc4626Metadata(): Promise<Erc4626Metadata[] | undefined> {
  try {
    const res = await fetch(ERC4626_METADATA_URL, {
      next: { revalidate: mins(15).toSecs() },
    })
    const metadata = (await res.json()) as Erc4626Metadata[]

    return metadata.map(metadata => {
      return {
        ...metadata,
        iconUrl: metadata.icon ? `${ERC4626_METADATA_ICON_BASE_URL}/${metadata.icon}` : undefined,
      }
    })
  } catch (error) {
    console.error('Unable to fetch erc4626 metadata', error)
    return undefined
  }
}

export async function getErc4626KeepOriginalScale(): Promise<Erc4626KeepOriginalScale> {
  try {
    const response = await fetch(ERC4626_METADATA_KEEP_ORIGINAL_SCALE_URL, {
      next: { revalidate: mins(15).toSecs() },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch ERC4626 keep original scale metadata')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching ERC4626 keep original scale metadata:', error)
    return {}
  }
}
