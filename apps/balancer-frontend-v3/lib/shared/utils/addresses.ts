import { getNativeAssetAddress, getWrappedNativeAssetAddress } from '@/lib/config/app.config'
import { SupportedChainId } from '@/lib/config/config.types'
import { Address, checksumAddress, isAddress } from 'viem'
import { GqlChain } from '../services/api/generated/graphql'

export function isSameAddress(address1: string, address2: string): boolean {
  if (!address1 || !address2) return false
  return address1.toLowerCase() === address2.toLowerCase()
}

export function isNativeAsset(
  chainId: GqlChain | SupportedChainId,
  tokenAddress: Address | string
) {
  return isSameAddress(getNativeAssetAddress(chainId), tokenAddress)
}

export function isWrappedNativeAsset(
  chainId: GqlChain | SupportedChainId,
  tokenAddress: Address | string
) {
  return isSameAddress(getWrappedNativeAssetAddress(chainId), tokenAddress)
}

export function includesAddress(addresses: string[], address: string): boolean {
  if (!address) return false
  addresses = addresses.map(a => (a ? a.toLowerCase() : ''))
  return addresses.includes(address.toLowerCase())
}

export function indexOfAddress(addresses: string[], address: string): number {
  if (!address) return -1
  addresses = addresses.map(a => (a ? a.toLowerCase() : ''))
  return addresses.indexOf(address.toLowerCase())
}

function containsAll(addresses1: string[], addresses2: string[]) {
  return addresses2.every(address2 =>
    addresses1.map(address1 => address1.toLowerCase()).includes(address2.toLowerCase())
  )
}

export const sameAddresses = (addresses1: string[], addresses2: string[]) =>
  containsAll(addresses1, addresses2) && containsAll(addresses2, addresses1)

/**
 * Select an Address when it's unknown what format the addresses are in.
 *
 * @param map A hashmap of address -> type
 * @param address An address to find in the map
 * @returns Item from map or undefined
 */
export function selectByAddress<T>(map: Record<string, T>, address: string): T | undefined {
  const foundAddress = Object.keys(map).find(itemAddress => {
    if (isSameAddress(itemAddress, address)) {
      return true
    }
  })
  if (foundAddress) return map[foundAddress]
}

// export function findByAddress<T>(
//   items: Array<T>,
//   address: string,
//   key = 'address'
// ): T | undefined {
//   return items.find(item => isSameAddress(item[key], address))
// }

export function removeAddress(address: string, addresses: string[]): string[] {
  return addresses.filter(a => !isSameAddress(a, address))
}

export function abbreviateAddress(address: string | Address, segLength = 4) {
  if (!address) return ''
  if (isAddress(address)) address = checksumAddress(address)
  const firstSegment = address.substring(0, segLength + 2)
  const lastSegment = address.substring(address.length, address.length - segLength)
  return `${firstSegment}...${lastSegment}`
}
