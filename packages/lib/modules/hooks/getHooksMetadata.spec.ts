import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { _lowerCaseAddresses, HooksMetadata } from './getHooksMetadata'

test('_lowerCaseAddresses converts uppercase addresses to lowercase', () => {
  const metadata: HooksMetadata[] = [
    {
      id: 'hook1',
      name: 'Test Hook',
      description: 'A test hook',
      addresses: {
        [GqlChain.Mainnet]: [
          '0xabcdef1234567890ABCDEF1234567890ABCDEF12',
          '0X1234567890ABCDEF1234567890ABCDEF12345678',
        ],
        [GqlChain.Arbitrum]: ['0xFEDCBA0987654321FEDCBA0987654321FEDCBA09'],
      },
    },
    {
      id: 'hook2',
      name: 'Another Hook',
      description: 'Another test hook',
      addresses: {
        [GqlChain.Polygon]: ['0xAAAABBBBCCCCddddEEEEFFFF0000111122223333'],
      },
    },
  ]

  const result = _lowerCaseAddresses(metadata)

  expect(result).toEqual([
    {
      id: 'hook1',
      name: 'Test Hook',
      description: 'A test hook',
      addresses: {
        [GqlChain.Mainnet]: [
          '0xabcdef1234567890abcdef1234567890abcdef12',
          '0x1234567890abcdef1234567890abcdef12345678',
        ],
        [GqlChain.Arbitrum]: ['0xfedcba0987654321fedcba0987654321fedcba09'],
      },
    },
    {
      id: 'hook2',
      name: 'Another Hook',
      description: 'Another test hook',
      addresses: {
        [GqlChain.Polygon]: ['0xaaaabbbbccccddddeeeeFFFF0000111122223333'.toLowerCase()],
      },
    },
  ])
})
