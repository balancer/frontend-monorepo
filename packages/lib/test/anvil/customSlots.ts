import { type Address, isAddressEqual } from 'viem'

const BRLA = '0xfecb3f7c54e2caae9dc6ac9060a822d47e053760'

export function getBalancerCustomSlot(tokenAddress: Address): bigint {
  /* Some slots cannot be easily guessed so we hardcode them from here:
    https://github.com/balancer/b-sdk/blob/2f8df4f20c9c9e478c58c5169c30055488d227c5/test/lib/utils/addresses.ts#L208
  */
  if (isAddressEqual(BRLA, tokenAddress)) return 51n
  return 0n
}
