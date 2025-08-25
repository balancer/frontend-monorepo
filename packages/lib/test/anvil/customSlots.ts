import { type Address, Hex, isAddressEqual } from 'viem'

const AUSD = '0x00000000efe302beaa2b3e6e1b18d08d69a9012a'

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
