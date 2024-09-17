import { emptyAddress } from './wagmi-helpers'

test('emptyAddress is false', () => {
  expect(emptyAddress).toBeFalsy()
})
