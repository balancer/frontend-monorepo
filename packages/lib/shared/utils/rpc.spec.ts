import { polygon } from 'viem/chains'
import { GqlChain } from '../services/api/generated/graphql'
import { drpcUrl, drpcUrlByChainId } from './rpc'

test('drpcUrl', () => {
  const privateKey = '1234'
  expect(drpcUrl(GqlChain.Arbitrum, privateKey)).toBe('https://lb.drpc.live/arbitrum/1234')
})

test('drpcUrlByChainId', () => {
  const privateKey = '1234'
  expect(drpcUrlByChainId(polygon.id, privateKey)).toBe('https://lb.drpc.live/polygon/1234')
})
