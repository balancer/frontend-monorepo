import { type Address, isAddressEqual } from 'viem'

const BRLA = '0xfecb3f7c54e2caae9dc6ac9060a822d47e053760'
const sAVAX = '0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be'

export function getBalancerCustomSlot(tokenAddress: Address): bigint {
  /* Some slots cannot be easily guessed so we hardcode them from here:
    https://github.com/balancer/b-sdk/blob/2f8df4f20c9c9e478c58c5169c30055488d227c5/test/lib/utils/addresses.ts#L208

    Use this tool as an alternative approach: https://github.com/kendricktan/slot20
  */
  if (isAddressEqual(BRLA, tokenAddress)) return 51n
  if (isAddressEqual(sAVAX, tokenAddress)) return 203n
  return 0n
}
