import { useMutation } from '@tanstack/react-query'
import {
  type Address,
  encodeAbiParameters,
  erc20Abi,
  getAbiItem,
  Hex,
  keccak256,
  pad,
  parseAbiParameters,
  publicActions,
  testActions,
  TestClient,
  toHex,
} from 'viem'

import { createConfig } from 'wagmi'
import { getBalancerCustomSlot, getPackedBalanceCustomSlot } from './customSlots'

type WagmiConfig = ReturnType<typeof createConfig>
type SetErcBalanceParameters = {
  address: Address
  tokenAddress: Address
  value: bigint
  wagmiConfig: WagmiConfig
  chainId: number
}
const balanceOfAbiItem = getAbiItem({ abi: erc20Abi, name: 'balanceOf' })

// set guessed storage slot to odd value
// so it's obvious when checking balanceOf it was the right slot
const SLOT_VALUE_TO_CHECK = 1337_1337_1337_1337_1337_1337_1337_1337_1337n

export type SetBalanceMutation = ReturnType<typeof useSetErc20Balance>

/**
 * Hack to be able to set the storage of the balanceOf mapping
 * other than hardcoding the storage slot per address or reading source
 * we can guess the mapping slot and test against `balanceOf` result
 * by looping from 0. so check slot 0, calculate the slot via keccak
 * and verify that the value of the storage slot is the same as the balanceOf call
 */
export function useSetErc20Balance() {
  return useMutation({
    async mutationFn({
      tokenAddress,
      address,
      value,
      wagmiConfig,
      chainId,
    }: SetErcBalanceParameters) {
      // TODO: Cache client instance?
      const client = wagmiConfig
        .getClient({ chainId })
        .extend(() => ({ mode: 'anvil' }))
        .extend(publicActions)
        .extend(testActions({ mode: 'anvil' }))

      // TODO: Compose storage slot manipulation into an action.
      // See https://github.com/paradigmxyz/rivet/pull/50#discussion_r1322267280
      let slotFound = false
      let slotGuess = getBalancerCustomSlot(tokenAddress)
      const customPackedSlot = getPackedBalanceCustomSlot(tokenAddress)

      console.log('Setting balance for address', {
        address,
        tokenAddress,
        slotGuess,
        chainId,
      })

      if (customPackedSlot) {
        console.log('Using custom packed slot for ', { tokenAddress, customPackedSlot })
        await setPackedBalance({
          client,
          tokenAddress,
          userAddress: address,
          value,
          storageSlot: customPackedSlot,
        })
        return
      }

      while (slotFound !== true) {
        // if mapping, use keccak256(abi.encode(address(key), uint(slot)));
        const encodedData = encodeAbiParameters(parseAbiParameters('address, uint'), [
          address,
          slotGuess,
        ])

        const oldSlotValue = await client.getStorageAt({
          address: tokenAddress,
          slot: keccak256(encodedData),
        })

        // user value might be something that might have collision (like 0)
        await client.setStorageAt({
          address: tokenAddress,
          index: keccak256(encodedData),
          value: pad(toHex(SLOT_VALUE_TO_CHECK)),
        })

        const newBalance = await client.readContract({
          abi: [balanceOfAbiItem],
          address: tokenAddress,
          functionName: 'balanceOf',
          args: [address],
        })

        const guessIsCorrect = newBalance === BigInt(SLOT_VALUE_TO_CHECK)

        if (guessIsCorrect) {
          slotFound = true
          await client.setStorageAt({
            address: tokenAddress,
            index: keccak256(encodedData),
            value: pad(toHex(value)),
          })
        } else {
          // check for a rebasing token (stETH)
          // by setting storage value again with an offset
          await client.setStorageAt({
            address: tokenAddress,
            index: keccak256(encodedData),
            value: pad(toHex(SLOT_VALUE_TO_CHECK + 1n)),
          })
          const newBalanceAgain = await client.readContract({
            abi: [balanceOfAbiItem],
            address: tokenAddress,
            functionName: 'balanceOf',
            args: [address],
          })

          // the diff in balanceOf is the offset in value
          if (newBalanceAgain - newBalance === 1n) {
            slotFound = true
            await client.setStorageAt({
              address: tokenAddress,
              index: keccak256(encodedData),
              value: pad(toHex(value)),
            })
            break
          }

          // reset storage slot
          await client.setStorageAt({
            address: tokenAddress,
            index: keccak256(encodedData),
            value: oldSlotValue || pad('0x0'),
          })

          // loop
          slotGuess++
          if (slotGuess >= 10n) {
            console.log('Could not find storage slot to set balance of token ', { tokenAddress })
            break
          }
        }
      }
    },
  })
}

/**
 * Set packed balance on a token with custom slot layout (e.g. AgoraDollar AUSD).
 *
 * The balance is packed after a `bool` (1 byte) into a `uint248` (31 bytes),
 * inside a mapping(address => struct) that lives in a custom storage slot.
 *
 * Hardcoded mapping setup in getPackedBalanceCustomSlot
 */
export async function setPackedBalance({
  client,
  tokenAddress,
  userAddress,
  value,
  storageSlot,
}: {
  client: TestClient
  tokenAddress: Address
  userAddress: Address
  value: bigint
  storageSlot: Hex // e.g. AgoraDollar's: '0x455730fe...'
}) {
  // Compute the mapping key: keccak256(pad(address) ++ storageSlot)
  const encoded = pad(userAddress) + storageSlot.slice(2)
  const slotKey = keccak256(encoded as Address)

  // Build the packed value: 1 byte isFrozen (0x00) + 31-byte padded balance
  const balance248 = toHex(value, { size: 31 }) // 31 bytes = 248 bits
  const fullSlotValue = '0x' + '00' + balance248.slice(2) // 1 byte + 31 bytes

  await client.setStorageAt({
    address: tokenAddress,
    index: slotKey,
    value: fullSlotValue as Address,
  })
}
