import {
  fetchAndMapMetadata,
  lowerCaseAddresses,
} from '@repo/lib/shared/utils/fetchAndLowercaseAddresses'
import { Address } from 'viem'

const FEE_MANAGERS_METADATA_URL =
  'https://raw.githubusercontent.com/balancer/metadata/refs/heads/main/fee_managers/index.json'

export enum FeeManagersId {
  EZKL = 'fee_manager_ezkl',
}

export type FeeManagersMetadata = {
  id: FeeManagersId
  name: string
  description: string
  addresses: Record<string, Address[]> // chainId -> addresses[]
}

export async function getFeeManagersMetadata(): Promise<FeeManagersMetadata[] | undefined> {
  return fetchAndMapMetadata<FeeManagersMetadata>(FEE_MANAGERS_METADATA_URL, lowerCaseAddresses)
}
