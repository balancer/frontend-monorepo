import { mins } from '@repo/lib/shared/utils/time'

const ERC4626_METADATA_URL =
  'https://raw.githubusercontent.com/balancer/metadata/main/erc4626/index.json'

const ERC4626_METADATA_ICON_BASE_URL =
  'https://raw.githubusercontent.com/balancer/metadata/main/erc4626/icons'

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
