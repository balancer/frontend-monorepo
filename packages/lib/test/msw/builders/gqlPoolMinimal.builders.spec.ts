import { aGqlPoolMinimalMock, anAprMock } from './gqlPoolMinimal.builders'

test('Builders are implicitly tested by the tests using them but this is for debugging when build edge cases', () => {
  expect(aGqlPoolMinimalMock({ address: 'foobar' }).address).toBe('foobar')
  expect(anAprMock().apr).toEqual({
    __typename: 'GqlPoolAprTotal',
    total: '0.005628271838682321',
  })
})
