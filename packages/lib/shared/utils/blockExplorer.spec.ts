import { sonicTokens } from '@repo/lib/test/integration/sonic-fixtures'
import { GqlChainValues } from '../services/api/graphql-enums'
import {
  getBlockExplorerName,
  getBlockExplorerAddressUrl,
  getBlockExplorerBlockUrl,
  getBlockExplorerTokenUrl,
  getBlockExplorerTxUrl,
} from './blockExplorer'

test('getBlockExplorerName', () => {
  expect(getBlockExplorerName(GqlChainValues.Sonic)).toBe('SonicScan')
})

test('getBlockExplorerAddressUrl', () => {
  const sonicUserAddress = '0x90830ed558f12d826370dc52e9d87947a7f18de9'

  expect(getBlockExplorerAddressUrl(sonicUserAddress, GqlChainValues.Sonic)).toBe(
    'https://sonicscan.org/address/0x90830ed558f12d826370dc52e9d87947a7f18de9'
  )
})

test('getBlockExplorerBlockUrl', () => {
  const blockNumber = 12345

  expect(getBlockExplorerBlockUrl(blockNumber, GqlChainValues.Sonic)).toBe(
    'https://sonicscan.org/block/12345'
  )
})

test('getBlockExplorerTokenUrl', () => {
  expect(getBlockExplorerTokenUrl(sonicTokens.sts, GqlChainValues.Sonic)).toBe(
    'https://sonicscan.org/token/0xe5da20f15420ad15de0fa650600afc998bbe3955'
  )
})

test('getBlockExplorerTxUrl', () => {
  const txHash = '0xb677ff33a885d57f19d23f0042eee4c049a52ee8339221dcf3099bd6a3fdaefc'

  expect(getBlockExplorerTxUrl(txHash, GqlChainValues.Sonic)).toBe(
    'https://sonicscan.org/tx/0xb677ff33a885d57f19d23f0042eee4c049a52ee8339221dcf3099bd6a3fdaefc'
  )
})
