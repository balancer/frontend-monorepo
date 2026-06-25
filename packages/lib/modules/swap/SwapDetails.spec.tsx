import { render } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { SwapDetails } from './SwapDetails'
import { GqlSorSwapTypeValues } from '@repo/lib/shared/services/api/graphql-enums'

vi.mock('@repo/lib/shared/hooks/useCurrency', () => ({
  useCurrency: () => ({ toCurrency: (val: string) => val }),
}))

vi.mock('../user/settings/UserSettingsProvider', () => ({
  useUserSettings: () => ({ slippage: '0.5', slippageDecimal: 0.005 }),
}))

vi.mock('../tokens/TokensProvider', () => ({
  useTokens: () => ({ usdValueForToken: () => '0' }),
}))

vi.mock('@repo/lib/modules/price-impact/PriceImpactProvider', () => ({
  usePriceImpact: () => ({
    priceImpactLevel: 'low',
    priceImpactColor: 'green',
    PriceImpactIcon: () => null,
    priceImpact: undefined,
  }),
}))

vi.mock('./SwapProvider', () => ({
  useSwap: () => ({
    tokenIn: { amount: '', address: '0x0' },
    tokenOut: { amount: '', address: '0x0' },
    swapType: GqlSorSwapTypeValues.ExactIn,
    tokenInInfo: undefined,
    tokenOutInfo: undefined,
    handler: { constructor: { name: 'BaseDefaultSwapHandler' } },
  }),
}))

vi.mock('./handlers/NativeWrap.handler', () => ({
  NativeWrapHandler: class NativeWrapHandler {},
}))

vi.mock('./handlers/BaseDefaultSwap.handler', () => ({
  BaseDefaultSwapHandler: class BaseDefaultSwapHandler {},
}))

vi.mock('@repo/lib/shared/components/icons/InfoIcon', () => ({
  InfoIcon: () => null,
}))

vi.mock('../price-impact/price-impact.utils', () => ({
  getFullPriceImpactLabel: () => '0%',
  getMaxSlippageLabel: () => '0.5%',
}))

vi.mock('./RoutesCard', () => ({
  RoutesPopover: () => null,
}))

vi.mock('pluralize', () => ({
  default: (word: string) => word,
}))

describe('SwapDetails', () => {
  test('does not crash when token amounts are empty strings', () => {
    // Regression: limitValue at lines 163-165 did bn(tokenOut.amount) / bn(tokenIn.amount)
    // which threw under BigNumber STRICT mode when amounts were empty strings.
    expect(() => render(<SwapDetails />)).not.toThrow()
  })
})
