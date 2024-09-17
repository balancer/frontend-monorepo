import { mins } from './time'

export enum SupportedCurrency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CNY = 'CNY',
  BTC = 'BTC',
  ETH = 'ETH',
}

export type FxRates = Record<SupportedCurrency, { code: string; value: number }>
type FxRatesResponse = {
  data: FxRates
}

export function symbolForCurrency(currency: SupportedCurrency): string {
  switch (currency) {
    case SupportedCurrency.USD:
      return '$'
    case SupportedCurrency.EUR:
      return '€'
    case SupportedCurrency.GBP:
      return '£'
    case SupportedCurrency.JPY:
      return '¥'
    case SupportedCurrency.CNY:
      return '¥'
    case SupportedCurrency.BTC:
      return '₿'
    case SupportedCurrency.ETH:
      return 'Ξ'
    default:
      return '$'
  }
}

const API_KEY = process.env.PRIVATE_CURRENCYAPI_KEY || ''

export async function getFxRates(): Promise<FxRates | undefined> {
  try {
    const res = await fetch(`https://api.currencyapi.com/v3/latest?apikey=${API_KEY}`, {
      next: { revalidate: mins(5).toSecs() },
    })
    const { data: rates } = (await res.json()) as FxRatesResponse
    return rates
  } catch (error) {
    console.error('Unable to fetch FX rates', error)
    return undefined
  }
}
