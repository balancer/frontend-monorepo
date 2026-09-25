import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { getGqlChain } from '@repo/lib/config/app.config'
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import { Address, Hash } from 'viem'
import { useAddLiquidityReceipt, useLstStakeReceipt, useLstWithdrawReceipt } from './receipt.hooks'
import { ProtocolVersion } from '@repo/lib/modules/pool/pool.types'

async function testAddReceipt(
  userAddress: Address,
  txHash: Hash,
  chainId = 146,
  protocolVersion: ProtocolVersion = 2
) {
  const { result } = testHook(() => {
    return useAddLiquidityReceipt({
      chain: getGqlChain(chainId),
      txHash,
      userAddress,
      protocolVersion,
    })
  })

  return result
}

async function testLstStakeReceipt(
  userAddress: Address,
  txHash: Hash,
  chain: GqlChain,
  protocolVersion: ProtocolVersion = 3
) {
  const { result } = testHook(() => {
    return useLstStakeReceipt({
      txHash,
      userAddress,
      chain,
      protocolVersion,
    })
  })

  return result
}

async function testLstWithdrawReceipt(
  userAddress: Address,
  txHash: Hash,
  chain: GqlChain,
  protocolVersion: ProtocolVersion = 3
) {
  const { result } = testHook(() => {
    return useLstWithdrawReceipt({
      txHash,
      userAddress,
      chain,
      protocolVersion,
    })
  })

  return result
}

test('returns is loading when user is not provided', async () => {
  const userAddress = '' as Address
  const txHash = '0x887f144bdfe73c7e585b0630361038bda9665aa213933f637d1d6fae9046652e'

  const result = await testAddReceipt(userAddress, txHash)

  await waitFor(() => expect(result.current.isLoading).toBeTruthy())
})

describe('queries Sonic stake TX', () => {
  const sTsAddress = '0xe5da20f15420ad15de0fa650600afc998bbe3955' // staked sonic

  test('when staking S to get stS', async () => {
    const userAddress = '0x35f391873F5ecAc80f46a6A1080c4E4743c7aC7D'
    // https://sonicscan.org/tx/0x75f34af99a5afc39412bc5305aee1d77da5bd4a963c11a2ac5d7ae9f564d2c77
    const txHash = '0x75f34af99a5afc39412bc5305aee1d77da5bd4a963c11a2ac5d7ae9f564d2c77'

    const result = await testLstStakeReceipt(userAddress, txHash, GqlChainValues.Sonic)

    await waitFor(() => expect(result.current.isLoading).toBeFalsy())

    expect(result.current.receivedToken).toEqual({
      humanAmount: '19.932125314218435816',
      tokenAddress: sTsAddress,
    })
  })
})

describe('queries stS withdraw TX', () => {
  const sonicAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' // Sonic

  test('when withdrawing stS to get S', async () => {
    const userAddress = '0xDb04eE8ec3946BAC366AD8711F2e7610f45c0c42'
    // https://sonicscan.org/tx/0x70ffae9f3ed4eb134dbd60b550f4da01b808bc5e5538832a30bf2cd61fcc4a46
    const txHash = '0x70ffae9f3ed4eb134dbd60b550f4da01b808bc5e5538832a30bf2cd61fcc4a46'

    const result = await testLstWithdrawReceipt(userAddress, txHash, GqlChainValues.Sonic)

    await waitFor(() => expect(result.current.isLoading).toBeFalsy())

    expect(result.current.receivedToken).toEqual({
      humanAmount: '1385.824287592362834227',
      tokenAddress: sonicAddress,
    })
  })
})
