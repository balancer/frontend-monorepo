import {
  fetchAndMapMetadata,
  lowerCaseAddresses,
} from '@repo/lib/shared/utils/fetchAndLowercaseAddresses'
import { Address } from 'viem'

const FEE_MANAGERS_METADATA_URL =
  'https://raw.githubusercontent.com/balancer/metadata/refs/heads/main/fee_managers/index.json'

export type FeeManagersMetadata = {
  id: string
  name: string
  description: string
  addresses: Record<string, Address[]> // chainId -> addresses[]
}

export async function getFeeManagersMetadata(): Promise<FeeManagersMetadata[] | undefined> {
  return fetchAndMapMetadata<FeeManagersMetadata>(FEE_MANAGERS_METADATA_URL, lowerCaseAddresses)
}
