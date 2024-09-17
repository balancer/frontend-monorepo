import { isNativeAsset } from './addresses'

test('isNativeAddress', () => {
  expect(isNativeAsset(1, '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')).toBeTruthy()
  expect(isNativeAsset(1, '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeEEEEE')).toBeTruthy()
  expect(isNativeAsset(42161, '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeEEEEE')).toBeTruthy()

  expect(isNativeAsset(1, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')).toBeFalsy()
  expect(isNativeAsset(42161, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')).toBeFalsy()
})
