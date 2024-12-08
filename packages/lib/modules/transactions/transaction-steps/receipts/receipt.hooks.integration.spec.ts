/* eslint-disable max-len */
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { getGqlChain } from '@repo/lib/config/app.config'
import { ethAddress, polAddress } from '@repo/lib/debug-helpers'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Address, Hash } from 'viem'
import { polygon } from 'viem/chains'
import {
  useAddLiquidityReceipt,
  useLstStakeReceipt,
  useRemoveLiquidityReceipt,
  useSwapReceipt,
} from './receipt.hooks'
import { ProtocolVersion } from '@repo/lib/modules/pool/pool.types'

async function testAddReceipt(
  userAddress: Address,
  txHash: Hash,
  chainId = 1,
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

async function testRemoveReceipt(
  userAddress: Address,
  txHash: Hash,
  chainId = 1,
  protocolVersion: ProtocolVersion = 2
) {
  const { result } = testHook(() => {
    return useRemoveLiquidityReceipt({
      txHash,
      userAddress,
      chain: getGqlChain(chainId),
      protocolVersion,
    })
  })
  return result
}

async function testSwapReceipt(
  userAddress: Address,
  txHash: Hash,
  chain: GqlChain,
  protocolVersion: ProtocolVersion = 2
) {
  const { result } = testHook(() => {
    return useSwapReceipt({
      txHash,
      userAddress,
      chain,
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

describe('receipts queries', () => {
  test('queries add liquidity transaction', async () => {
    // https://etherscan.io/tx/0x887f144bdfe73c7e585b0630361038bda9665aa213933f637d1d6fae9046652e
    const userAddress = '0x2a88a454A7b0C29d36D5A121b7Cf582db01bfCEC'
    const txHash = '0x887f144bdfe73c7e585b0630361038bda9665aa213933f637d1d6fae9046652e'

    const result = await testAddReceipt(userAddress, txHash)

    await waitFor(() => expect(result.current.isLoading).toBeFalsy())

    await waitFor(() => expect(result.current.sentTokens).toBeDefined())

    expect(result.current.sentTokens).toEqual([
      {
        tokenAddress: '0x198d7387fa97a73f05b8578cdeff8f2a1f34cd1f',
        humanAmount: '12',
      },
      {
        tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        humanAmount: '0.04',
      },
    ])

    expect(result.current.receivedBptUnits).toBe('7.669852124112308228')
  })

  test('queries add liquidity with native token', async () => {
    // https://polygonscan.com/tx/0x611a0eeeff15c2a5efc587b173fa577475134de2554a452259f112db67bd4de8
    const userAddress = '0xf76142b79Db34E57852d68F9c52C0E24f7349647'
    const txHash = '0x611a0eeeff15c2a5efc587b173fa577475134de2554a452259f112db67bd4de8'

    const result = await testAddReceipt(userAddress, txHash, polygon.id)

    await waitFor(() => expect(result.current.isLoading).toBeFalsy())
    await waitFor(() => expect(result.current.sentTokens).toBeDefined())

    expect(result.current.sentTokens).toEqual([
      {
        tokenAddress: polAddress,
        humanAmount: '1',
      },
    ])

    expect(result.current.receivedBptUnits).toBe('0.984524168989962117')
  })

  test('queries remove liquidity transaction', async () => {
    // https://etherscan.io/tx/0x71301b46984d3d2e6b58c1fc0c99cc0561ec0f26d53bda8413528a7fb6828fc3
    const userAddress = '0x84f240cA232917d771DFBbd8C917B4669Ed640CD'
    const txHash = '0x71301b46984d3d2e6b58c1fc0c99cc0561ec0f26d53bda8413528a7fb6828fc3'

    const result = await testRemoveReceipt(userAddress, txHash)

    await waitFor(() => expect(result.current.isLoading).toBeFalsy())
    await waitFor(() => expect(result.current.receivedTokens).toBeDefined())

    expect(result.current.receivedTokens).toEqual([
      {
        humanAmount: '16597.845312687911573359',
        tokenAddress: '0x198d7387fa97a73f05b8578cdeff8f2a1f34cd1f',
      },
      {
        humanAmount: '4.553531492712836774',
        tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      },
    ])

    expect(result.current.sentBptUnits).toBe('6439.400687368663510166')
  })

  describe('queries swap transaction', () => {
    const maticAddress = '0x0000000000000000000000000000000000001010'
    const wMaticAddress = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
    const daiAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'

    test('when the native asset is not included (from DAI to WMATIC)', async () => {
      const userAddress = '0xf76142b79Db34E57852d68F9c52C0E24f7349647'
      // https://polygonscan.com/tx/0x11380dcffb24c512da18f032d9f7354d154cfda6bbab0633df182fcd202c4244
      const txHash = '0x11380dcffb24c512da18f032d9f7354d154cfda6bbab0633df182fcd202c4244'

      const result = await testSwapReceipt(userAddress, txHash, GqlChain.Polygon)

      await waitFor(() => expect(result.current.isLoading).toBeFalsy())

      expect(result.current.sentToken).toEqual({
        humanAmount: '1',
        tokenAddress: daiAddress.toLowerCase(),
      })

      expect(result.current.receivedToken).toEqual({
        humanAmount: '1.419839650912753603',
        tokenAddress: wMaticAddress,
      })
    })

    test('when the native asset is the token in (from POL to DAI)', async () => {
      const userAddress = '0xf76142b79Db34E57852d68F9c52C0E24f7349647'
      // https://polygonscan.com/tx/0x78ddd90502509a264a5e8f4f3732668db669e7614f4887f2a233ce39e5eafa7c
      const txHash = '0x78ddd90502509a264a5e8f4f3732668db669e7614f4887f2a233ce39e5eafa7c'

      const result = await testSwapReceipt(userAddress, txHash, GqlChain.Polygon)

      await waitFor(() => expect(result.current.isLoading).toBeFalsy())

      expect(result.current.sentToken).toEqual({
        humanAmount: '1',
        tokenAddress: maticAddress,
      })

      expect(result.current.receivedToken).toEqual({
        humanAmount: '0.693570611425675513',
        tokenAddress: daiAddress.toLowerCase(),
      })
    })

    test('when the native asset is the token out (from DAI to POL)', async () => {
      const userAddress = '0xf76142b79Db34E57852d68F9c52C0E24f7349647'
      // https://polygonscan.com/tx/0xe0b75845d13ae12029c8dfef68488b3bf35347460fafdb3a15a5c7f884226288
      const txHash = '0xe0b75845d13ae12029c8dfef68488b3bf35347460fafdb3a15a5c7f884226288'

      const result = await testSwapReceipt(userAddress, txHash, GqlChain.Polygon)

      await waitFor(() => expect(result.current.isLoading).toBeFalsy())

      expect(result.current.sentToken).toEqual({
        humanAmount: '0.1',
        tokenAddress: daiAddress.toLowerCase(),
      })

      expect(result.current.receivedToken).toEqual({
        humanAmount: '0.241277224191485579',
        tokenAddress: maticAddress,
      })
    })

    //TODO: adapt to a sepolia swap in v12
    test.skip('when the native asset is the token out that goes through a wrap (from stataEthDAI to WETH and then to ETH)', async () => {
      const userAddress = '0xf76142b79Db34E57852d68F9c52C0E24f7349647'
      // https://sepolia.etherscan.io/tx/0xd8ad2a7f8e51be9735ae2886ca936cca62e395524b284f7a97cf7ad33a361a04
      const txHash = '0xd8ad2a7f8e51be9735ae2886ca936cca62e395524b284f7a97cf7ad33a361a04'

      const protocolVersion = 3
      const result = await testSwapReceipt(userAddress, txHash, GqlChain.Sepolia, protocolVersion)

      const stataEthDai = '0xde46e43f46ff74a23a65ebb0580cbe3dfe684a17'

      await waitFor(() => expect(result.current.isLoading).toBeFalsy())

      expect(result.current.sentToken).toEqual({
        humanAmount: '25',
        tokenAddress: stataEthDai.toLowerCase(),
      })

      expect(result.current.receivedToken).toEqual({
        humanAmount: '0.136746996966924842',
        tokenAddress: ethAddress,
      })
    })
  })

  test('returns is loading when user is not provided', async () => {
    const userAddress = '' as Address
    const txHash = '0x887f144bdfe73c7e585b0630361038bda9665aa213933f637d1d6fae9046652e'

    const result = await testAddReceipt(userAddress, txHash)

    await waitFor(() => expect(result.current.isLoading).toBeTruthy())
  })

  describe('queries LST stake transaction', () => {
    const sFTMxAddress = '0xd7028092c830b5c8fce061af2e593413ebbc1fc1'

    test.only('when staking 1 FTM to get sFTMx', async () => {
      const userAddress = '0xf76142b79Db34E57852d68F9c52C0E24f7349647'
      // https://ftmscan.com/tx/0x5b7e58dd5204253a865a141640f142d4945b614acf5fc8aed3fb1408c0bdbce1
      const txHash = '0x5b7e58dd5204253a865a141640f142d4945b614acf5fc8aed3fb1408c0bdbce1'

      const result = await testLstStakeReceipt(userAddress, txHash, GqlChain.Fantom)

      await waitFor(() => expect(result.current.isLoading).toBeFalsy())

      expect(result.current.receivedToken).toEqual([
        {
          humanAmount: '0.865720333575772047',
          tokenAddress: sFTMxAddress,
        },
      ])
    })
  })
})
