'use client'

import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { useFxRates } from './FxRatesProvider'
import { symbolForCurrency } from '../utils/currencies'
import { Numberish, bn, fNum, ZERO_VALUE_DASH, isZero } from '../utils/numbers'

type CurrencyOpts = {
  withSymbol?: boolean
  abbreviated?: boolean
  noDecimals?: boolean
  forceThreeDecimals?: boolean
}

export function useCurrency() {
  const { currency } = useUserSettings()
  const { getFxRate, hasFxRates } = useFxRates()

  // Converts a USD value to the user's currency value.
  function toUserCurrency(usdVal: Numberish): string {
    const amount = usdVal.toString()
    const fxRate = getFxRate(currency)

    return bn(amount).times(fxRate).toString()
  }

  function formatCurrency(value: string | undefined) {
    const symbol = hasFxRates ? symbolForCurrency(currency) : '$'
    return `${symbol}${value ?? '0'}`
  }

  function parseCurrency(value: string) {
    return value.replace(/^\$/, '')
  }

  // Converts a USD value to the user's currency and formats in fiat style.
  function toCurrency(
    usdVal: Numberish,
    {
      withSymbol = true,
      abbreviated = true,
      noDecimals = false,
      forceThreeDecimals = false,
    }: CurrencyOpts = {}
  ): string {
    const symbol = hasFxRates ? symbolForCurrency(currency) : '$'
    const convertedAmount = toUserCurrency(usdVal)

    const formattedAmount = fNum(noDecimals ? 'integer' : 'fiat', convertedAmount, {
      abbreviated,
      forceThreeDecimals,
    })

    if (formattedAmount.startsWith('<')) {
      return withSymbol ? '<' + symbol + formattedAmount.substring(1) : formattedAmount
    }

    return withSymbol ? symbol + formattedAmount : formattedAmount
  }

  // Formats currency balance with en-dash for zero values
  function formatCurrencyBalance(usdVal: Numberish, options: CurrencyOpts = {}): string {
    if (isZero(usdVal)) {
      return ZERO_VALUE_DASH
    }
    return toCurrency(usdVal, options)
  }

  return { toCurrency, formatCurrency, parseCurrency, formatCurrencyBalance }
}
