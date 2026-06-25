import { polygon, sepolia } from 'viem/chains'
import { GqlChain } from '../services/api/generated/graphql'
import { getRpcUrl, getRpcUrlByChainId, getDrpcUrl, getDrpcUrlByChainId } from './rpc'

test('getRpcUrl (direct.dev)', () => {
  const key = '1234'
  expect(getRpcUrl(GqlChain.Arbitrum, key)).toBe('https://prod.rpc.direct.dev/v1/1234/arbitrum')
})

test('getRpcUrl (direct.dev) handles sepolia slug', () => {
  const key = '1234'
  expect(getRpcUrl(GqlChain.Sepolia, key)).toBe(
    'https://prod.rpc.direct.dev/v1/1234/ethereum-sepolia'
  )
})

test('getRpcUrlByChainId (direct.dev)', () => {
  const key = '1234'
  expect(getRpcUrlByChainId(polygon.id, key)).toBe('https://prod.rpc.direct.dev/v1/1234/polygon')
})

test('getDrpcUrl', () => {
  const key = '1234'
  expect(getDrpcUrl(GqlChain.Arbitrum, key)).toBe('https://lb.drpc.live/arbitrum/1234')
})

test('getDrpcUrlByChainId handles sepolia slug', () => {
  const key = '1234'
  expect(getDrpcUrlByChainId(sepolia.id, key)).toBe('https://lb.drpc.live/sepolia/1234')
})
