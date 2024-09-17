'use client'

import { useUserSettings } from '@/lib/modules/user/settings/UserSettingsProvider'
import { useFxRates } from './FxRatesProvider'
import { symbolForCurrency } from '../utils/currencies'
import { Numberish, bn, fNum } from '../utils/numbers'

type CurrencyOpts = { withSymbol?: boolean; abbreviated?: boolean }

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
    { withSymbol = true, abbreviated = true }: CurrencyOpts = {}
  ): string {
    const symbol = hasFxRates ? symbolForCurrency(currency) : '$'
    const convertedAmount = toUserCurrency(usdVal)
    const formattedAmount = fNum('fiat', convertedAmount, { abbreviated })

    if (formattedAmount.startsWith('<')) {
      return withSymbol ? '<' + symbol + formattedAmount.substring(1) : formattedAmount
    }

    return withSymbol ? symbol + formattedAmount : formattedAmount
  }

  return { toCurrency, formatCurrency, parseCurrency }
}
