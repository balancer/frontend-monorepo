import { balAddress } from '@repo/lib/debug-helpers'
import { GqlChain } from '../services/api/generated/graphql'
import {
  getBlockExplorerName,
  getBlockExplorerAddressUrl,
  getBlockExplorerBlockUrl,
  getBlockExplorerTokenUrl,
  getBlockExplorerTxUrl,
} from './blockExplorer'

test('getBlockExplorerName', () => {
  expect(getBlockExplorerName(GqlChain.Polygon)).toBe('Polygonscan')
})

test('getBlockExplorerName', () => {
  const gnosisUserAddress = '0x90830ed558f12d826370dc52e9d87947a7f18de9'
  expect(getBlockExplorerAddressUrl(gnosisUserAddress, GqlChain.Gnosis)).toBe(
    'https://gnosisscan.io/address/0x90830ed558f12d826370dc52e9d87947a7f18de9'
  )
})

test('getBlockExplorerName', () => {
  const blockNumber = 12345
  expect(getBlockExplorerBlockUrl(blockNumber, GqlChain.Optimism)).toBe(
    'https://optimistic.etherscan.io/block/12345'
  )
})

test('getBlockExplorerTokenUrl', () => {
  expect(getBlockExplorerTokenUrl(balAddress, GqlChain.Mainnet)).toBe(
    'https://etherscan.io/token/0xba100000625a3754423978a60c9317c58a424e3d'
  )
})

test('getBlockExplorerTxUrl', () => {
  const txHash = '0xb677ff33a885d57f19d23f0042eee4c049a52ee8339221dcf3099bd6a3fdaefc'
  expect(getBlockExplorerTxUrl(txHash, GqlChain.Mainnet)).toBe(
    'https://etherscan.io/tx/0xb677ff33a885d57f19d23f0042eee4c049a52ee8339221dcf3099bd6a3fdaefc'
  )
})
