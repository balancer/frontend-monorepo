import {
  fetchAndMapMetadata,
  lowerCaseAddresses,
} from '@repo/lib/shared/utils/fetchAndLowercaseAddresses'
import { Address } from 'viem'

const HOOKS_METADATA_URL =
  'https://raw.githubusercontent.com/balancer/metadata/refs/heads/main/hooks/index.json'

export type HooksMetadata = {
  id: string
  name: string
  description: string
  learnMore?: string
  addresses: Record<string, Address[]> // chainId -> addresses[]
}

export async function getHooksMetadata(): Promise<HooksMetadata[] | undefined> {
  return fetchAndMapMetadata<HooksMetadata>(HOOKS_METADATA_URL, lowerCaseAddresses)
}
