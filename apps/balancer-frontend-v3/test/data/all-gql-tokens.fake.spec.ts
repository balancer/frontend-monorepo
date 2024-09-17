import { FakeTokenSymbol, fakeTokenBySymbol, fakeTokenSymbols } from './all-gql-tokens.fake'

test('Has fake definitions for all the symbols in FakeTokenSymbol', () => {
  fakeTokenSymbols.forEach((symbol: FakeTokenSymbol) => {
    expect(fakeTokenBySymbol(symbol)).toBeDefined()
  })
})
