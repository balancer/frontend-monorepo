import { type Address, Hex, isAddressEqual } from 'viem'

const BRLA = '0xfecb3f7c54e2caae9dc6ac9060a822d47e053760'
const sAVAX = '0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be'
const avaxUSDT = '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7'
const AUSD = '0x00000000efe302beaa2b3e6e1b18d08d69a9012a'

export function getBalancerCustomSlot(tokenAddress: Address): bigint {
  /* Some slots cannot be easily guessed so we hardcode them from here:
    https://github.com/balancer/b-sdk/blob/2f8df4f20c9c9e478c58c5169c30055488d227c5/test/lib/utils/addresses.ts#L208

    Use this tool as an alternative approach: https://github.com/kendricktan/slot20
  */
  if (isAddressEqual(BRLA, tokenAddress)) return 51n
  if (isAddressEqual(sAVAX, tokenAddress)) return 203n
  if (isAddressEqual(avaxUSDT, tokenAddress)) return 51n
  return 0n
}

export function getPackedBalanceCustomSlot(tokenAddress: Address): Hex | undefined {
  /* Some tokens have packed slots which require a different approach (setPackedBalance)
    Context: https://book.getfoundry.sh/reference/forge-std/enable_packed_slots
  */
  if (isAddressEqual(AUSD, tokenAddress)) {
    // https://book.getfoundry.sh/reference/forge-std/std-storage#packed-slot-example
    return '0x455730fed596673e69db1907be2e521374ba893f1a04cc5f5dd931616cd6b700'
  }

  return undefined
}
