'use client'

import BigNumber from 'bignumber.js'
import { MAX_UINT256 } from '@balancer/sdk'
import { KeyboardEvent } from 'react'
import { parseUnits } from 'viem'
import { isNumber, toNumber } from 'lodash'

// Allows calling JSON.stringify with bigints
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}

// Enable strict mode globally. bn() throws on invalid inputs (no NaN fallback).
BigNumber.set({ STRICT: true })

export const MAX_BIGINT = BigInt(MAX_UINT256)
export const MAX_BIGNUMBER = bn(MAX_UINT256)

export const INTEGER_FORMAT = '0,0'
export const FIAT_FORMAT_A = '0,0.00a'
export const FIAT_FORMAT_3_DECIMALS = '0,0.000a'
export const FIAT_FORMAT = '0,0.00'
export const FIAT_FORMAT_WITHOUT_DECIMALS = '0,0'
export const TOKEN_FORMAT_A = '0,0.[0000]a'
export const TOKEN_FORMAT_A_BIG = '0,0.[00]a'
export const TOKEN_FORMAT = '0,0.[0000]'
export const APR_FORMAT = '0,0.00%'
export const APR_FORMAT_WITHOUT_DECIMALS = '0,0%'
export const SLIPPAGE_FORMAT = '0.00%'
export const FEE_FORMAT = '0.[0000]%'
export const WEIGHT_FORMAT = '(%0,0)'
export const WEIGHT_FORMAT_ONE_DECIMAL = '(%0,0.0)'
export const WEIGHT_FORMAT_TWO_DECIMALS = '(%0,0.00)'
export const PRICE_IMPACT_FORMAT = '0,0.00%'
export const INTEGER_PERCENTAGE_FORMAT = '0%'
export const BOOST_FORMAT = '0.000'

// Do not display APR values greater than this amount; they are likely to be nonsensical
// These can arise from pools with extremely low balances (e.g., completed LBPs)
export const APR_UPPER_THRESHOLD = 1_000_000
export const APR_LOWER_THRESHOLD = 0.0000001

// Do not display bn values lower than this amount; they are likely to generate NaN results
export const BN_LOWER_THRESHOLD = 0.000001

// Display <0.001 for small amounts
export const AMOUNT_LOWER_THRESHOLD = 0.001
export const SMALL_AMOUNT_LABEL = '<0.001'
// Display <0.01% for small percentages)
export const PERCENTAGE_LOWER_THRESHOLD = 0.0001
export const SMALL_PERCENTAGE_LABEL = '<0.01%'

// fiat value threshold for displaying the fiat format without cents
export const FIAT_CENTS_THRESHOLD = '100000'

export const USD_LOWER_THRESHOLD = 0.009

// Dash symbol used for zero balances and empty values
export const ZERO_VALUE_DASH = '-'

export type Numberish = string | number | bigint | BigNumber
export type NumberFormatter = (val: Numberish) => string

export function bn(val: Numberish): BigNumber {
  // Programmer errors (null/undefined) should still throw
  if (val == null) {
    throw new TypeError(`Cannot create BigNumber from ${val}`)
  }
  return new BigNumber(val.toString())
}

type FormatOpts = {
  abbreviated?: boolean
  forceThreeDecimals?: boolean
  canBeNegative?: boolean
  hideSmallPercentage?: boolean
  decimals?: number
}

/**
 * String formatting helpers replacing numeral.js.
 * We rely on BigNumber for deterministic rounding (matching your tests),
 * and implement grouping + compact suffixes ("k", "m") to match numeral outputs.
 */

function groupIntegerString(intStr: string): string {
  // intStr is non-negative integer string
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function roundHalfUp(value: BigNumber, dp: number): BigNumber {
  return value.decimalPlaces(dp, BigNumber.ROUND_HALF_UP)
}

function toIntegerGrouped(val: BigNumber): string {
  if (val.isZero()) return '0'
  const neg = val.isNegative()
  const abs = val.abs()
  const intStr = abs.integerValue(BigNumber.ROUND_FLOOR).toFixed(0)
  const grouped = groupIntegerString(intStr)
  return neg ? `-${grouped}` : grouped
}

function stripTrailingZerosDecimalStr(s: string): string {
  // For "12.3400" -> "12.34", "12.000" -> "12", "12." -> "12"
  if (!s.includes('.')) return s
  return s.replace(/(\.\d*?[1-9])0+$/g, '$1').replace(/\.0+$/, '')
}

function formatCompactKMB(val: BigNumber, maxFractionDigits: number): string {
  if (val.isZero()) return '0'

  const neg = val.isNegative()
  const abs = val.abs()

  const thousand = bn(1_000)
  const million = bn(1_000_000)
  const billion = bn(1_000_000_000)

  let divisor: BigNumber
  let suffix: string

  if (abs.gte(billion)) {
    divisor = billion
    suffix = 'b'
  } else if (abs.gte(million)) {
    divisor = million
    suffix = 'm'
  } else {
    divisor = thousand
    suffix = 'k'
  }

  const scaled = abs.div(divisor)
  const rounded = roundHalfUp(scaled, maxFractionDigits)

  // numeral "a" keeps only significant decimals up to the max (trims trailing zeros)
  let str = rounded.toFixed(maxFractionDigits)
  str = stripTrailingZerosDecimalStr(str)

  return neg ? `-${str}${suffix}` : `${str}${suffix}`
}

function formatNumberWithFixedDpGrouped(val: BigNumber, dp: number): string {
  if (val.isZero()) return `0${dp ? '.' + '0'.repeat(dp) : ''}`
  const neg = val.isNegative()
  const abs = val.abs()

  const rounded = roundHalfUp(abs, dp)
  const s = rounded.toFixed(dp)
  const [intPart, fracPart] = s.split('.')

  const groupedInt = groupIntegerString(intPart)
  const sign = neg ? '-' : ''
  if (dp === 0) return `${sign}${groupedInt}`
  return `${sign}${groupedInt}.${fracPart}`
}

// Formats an integer value.
function integerFormat(val: Numberish): string {
  if (isSmallAmount(val)) return '0'
  return toIntegerGrouped(bn(val))
}

// Formats a fiat value.
function fiatFormat(
  val: Numberish,
  { abbreviated = true, forceThreeDecimals = false }: FormatOpts = {}
): string {
  if (isSmallAmount(val)) return SMALL_AMOUNT_LABEL

  const v = bn(val)

  if (forceThreeDecimals || requiresThreeDecimals(val)) {
    // In your spec/tests, when forced (or when in 0.001..0.01 band) the output is 3 decimals (not compact).
    // Examples: 0.555 -> 0.555 ; 0.002696.. -> 0.003
    const rounded = roundHalfUp(v, 3)
    const s = rounded.toFixed(3)
    // avoid "-0.000"
    return s.startsWith('-0.') ? s.slice(1) : s
  }

  if (abbreviated) {
    // 0,0.00a behavior:
    // - < 1000 => 2 decimals, no suffix
    // - >= 1000 => compact k/m with 2 decimals (suffix trimmed)
    const abs = v.abs()
    if (abs.gte(bn('1000'))) {
      return formatCompactKMB(v, 2)
    }
    return formatNumberWithFixedDpGrouped(v, 2)
  }

  // non-abbreviated
  if (isMoreThanOrEqualToAmount(val, FIAT_CENTS_THRESHOLD)) {
    // hide cents
    return toIntegerGrouped(v)
  }

  // In your tests, 0.002696... -> 0.003 (3 decimals) and 56789.123... -> 56,789.12 (2 decimals)
  if (requiresThreeDecimals(val)) {
    const rounded = roundHalfUp(v, 3)
    const s = rounded.toFixed(3)
    return s.startsWith('-0.') ? s.slice(1) : s
  }

  return formatNumberWithFixedDpGrouped(v, 2)
}

// Formats a token value.
function tokenFormat(val: Numberish, { abbreviated = true }: FormatOpts = {}): string {
  const bnVal = bn(val)
  if (!bnVal.isFinite() && bnVal.isPositive()) return '∞'

  if (!bnVal.isZero() && bnVal.lte(bn('0.00001'))) return '< 0.00001'
  if (!bnVal.isZero() && bnVal.lt(bn('0.0001'))) return '< 0.0001'

  if (bnVal.isZero()) return '0'

  const abs = bnVal.abs()

  if (abbreviated) {
    // Matches your tests:
    // - < 0.01 => keep up to 4 decimals (but trim trailing zeros)
    // - >= 1000 => compact k/m with 2 decimals (trim trailing zeros)
    // - >= 1 and < 1000 => keep to 4 decimals but trim trailing zeros,
    //   while allowing inputs like "10" to remain "10"
    if (abs.gte(bn('1000'))) return formatCompactKMB(bnVal, 2)

    if (abs.lt(bn('0.01'))) {
      // Use up to 4dp, trim trailing zeros.
      const rounded4 = roundHalfUp(bnVal, 4).toFixed(4)
      // Your tests:
      // - 0.012345 -> 0.0123 (rounded 4dp)
      // - 0.000493315.. -> 0.0005 (rounded 4dp)
      // - 0.001 and 0.006 keep their decimals (trim trailing zeros)
      const trimmed = stripTrailingZerosDecimalStr(rounded4)
      return trimmed.startsWith('-0.') ? trimmed.slice(1) : trimmed
    }

    // For 1 <= x < 1000, numeral outputs preserve the scale implied by the input,
    // but your tests only cover 1, 1.234, 10, 10.1234, 100, 123.456.
    // We'll round to 4dp and trim trailing zeros.
    const rounded4 = roundHalfUp(bnVal, 4).toFixed(4)
    const trimmed = stripTrailingZerosDecimalStr(rounded4)
    return trimmed.startsWith('-0.') ? trimmed.slice(1) : trimmed
  }

  // Non-abbreviated: 0,0.[0000] => up to 4 decimals, trim trailing zeros
  const rounded4 = roundHalfUp(bnVal, 4)
  const s = rounded4.toFixed(4)
  const [intPart, fracPart] = s.split('.')
  const sign = s.startsWith('-') ? '-' : ''
  const absInt = s.startsWith('-') ? intPart.slice(1) : intPart
  const groupedInt = groupIntegerString(absInt)
  const fracTrimmed = fracPart.replace(/0+$/, '')
  if (!fracTrimmed) return `${sign}${groupedInt}`
  return `${sign}${groupedInt}.${fracTrimmed}`
}

// Formats an APR value as a percentage.
function aprFormat(apr: Numberish, { canBeNegative = false }: FormatOpts = {}): string {
  const aprBn = bn(apr)

  if (aprBn.gt(APR_UPPER_THRESHOLD)) return '-'
  if (isSmallPercentage(apr) && !canBeNegative) return SMALL_PERCENTAGE_LABEL

  // numeral '0,0.00%' semantics: value × 100, then fixed decimals with grouping.
  // > 1000% displays without decimals: 12.3456789 => 1,235%
  if (aprBn.abs().gt(10)) {
    return `${toIntegerGrouped(roundHalfUp(aprBn.times(100), 0))}%`
  }

  // Otherwise 2 decimals: 0.10 => 10.00%
  const rounded2 = roundHalfUp(aprBn.times(100), 2)
  const s = rounded2.toFixed(2) // keep 2 decimals
  const [intPart, frac] = s.split('.')
  const neg = intPart.startsWith('-')
  const groupedInt = groupIntegerString(neg ? intPart.slice(1) : intPart)
  const sign = neg ? '-' : ''
  return `${sign}${groupedInt}.${frac}%`
}

// Formats a slippage value as a percentage.
function slippageFormat(slippage: Numberish): string {
  if (isSmallPercentage(slippage, { isPercentage: true })) return SMALL_PERCENTAGE_LABEL
  // numeral '0.00%' semantics: value × 100, then 2 fixed decimals + '%'
  // 0.10 => 0.10%  (slippage inputs arrive as percent points)
  const v = bn(slippage).div(100)
  const rounded2 = roundHalfUp(v.times(100), 2)
  const s = rounded2.toFixed(2)
  const [intPart, frac] = s.split('.')
  const neg = intPart.startsWith('-')
  const groupedInt = groupIntegerString(neg ? intPart.slice(1) : intPart)
  const sign = neg ? '-' : ''
  return `${sign}${groupedInt}.${frac}%`
}

// Formats a fee value as a percentage.
function feePercentFormat(fee: Numberish, { hideSmallPercentage = true }: FormatOpts = {}): string {
  if (hideSmallPercentage && isSmallPercentage(fee)) return SMALL_PERCENTAGE_LABEL

  // numeral with "0.[0000]%" will treat input as percent fraction? In your tests:
  // fNum('feePercent','0.10') => '10%' and for 0.0010 => 0.1%
  // That implies: input * 100 = shown percent.
  const percent = bn(fee).times(100)

  const rounded4 = roundHalfUp(percent, 4).toFixed(4)
  const trimmed = stripTrailingZerosDecimalStr(rounded4)
  return `${trimmed}%`
}

// Formats a weight value as a percentage.
function weightFormat(
  val: Numberish,
  { abbreviated = true, decimals = 2 }: FormatOpts = {}
): string {
  if (isSmallPercentage(val)) return SMALL_PERCENTAGE_LABEL

  const percent = bn(val).times(100)

  if (abbreviated) {
    // (%0,0)
    return `(${toIntegerGrouped(roundHalfUp(percent, 0))})`
  }

  if (decimals === 1) {
    // (%0,0.0)
    const rounded1 = roundHalfUp(percent, 1)
    const s = rounded1.toFixed(1)
    const [intPart, frac] = s.split('.')
    const neg = intPart.startsWith('-')
    const groupedInt = groupIntegerString(neg ? intPart.slice(1) : intPart)
    const sign = neg ? '-' : ''
    return `(${sign}${groupedInt}.${frac})`
  }

  // (%0,0.00)
  const rounded2 = roundHalfUp(percent, 2)
  const s = rounded2.toFixed(2)
  const [intPart, frac] = s.split('.')
  const neg = intPart.startsWith('-')
  const groupedInt = groupIntegerString(neg ? intPart.slice(1) : intPart)
  const sign = neg ? '-' : ''
  return `(${sign}${groupedInt}.${frac})`
}

// Formats a price impact value as a percentage.
function priceImpactFormat(val: Numberish): string {
  if (isSmallPercentage(val)) return SMALL_PERCENTAGE_LABEL
  const v = bn(val).times(100)
  const rounded2 = roundHalfUp(v, 2)
  const s = rounded2.toFixed(2)
  const [intPart, frac] = s.split('.')
  const neg = intPart.startsWith('-')
  const groupedInt = groupIntegerString(neg ? intPart.slice(1) : intPart)
  const sign = neg ? '-' : ''
  return `${sign}${groupedInt}.${frac}%`
}

// Formats an integer value as a percentage.
function integerPercentageFormat(val: Numberish): string {
  const percent = bn(val).times(100)
  return `${toIntegerGrouped(roundHalfUp(percent, 0))}%`
}

function boostFormat(val: Numberish): string {
  return roundHalfUp(bn(val), 3).toFixed(3)
}

function tokenRatioFormat(val: Numberish): string {
  // This one in your original code uses numeral directly with fixed dp bands.
  // We'll reproduce those bands with BigNumber rounding to exact dp.
  const v = bn(val)

  if (v.lt(0.001)) return roundHalfUp(v, 6).toFixed(6)
  if (v.lt(0.01)) return roundHalfUp(v, 5).toFixed(5)
  if (v.lt(1.2)) return roundHalfUp(v, 4).toFixed(4)
  if (v.lt(2)) return roundHalfUp(v, 3).toFixed(3)
  if (v.lt(10)) return roundHalfUp(v, 2).toFixed(2)
  if (v.lt(100)) return roundHalfUp(v, 1).toFixed(1)

  return toIntegerGrouped(v)
}

// Sums an array of numbers safely using bignumber.js.
export function safeSum(amounts: Numberish[]): string {
  return amounts.reduce((a, b) => bn(a).plus(b.toString()), bn(0)).toString()
}

// Prevents invalid characters from being entered into a number input.
export function blockInvalidNumberInput(event: KeyboardEvent<HTMLInputElement>): void {
  if (['e', 'E', '+', '-'].includes(event.key)) {
    event.preventDefault()
  }
}

type NumberFormat =
  | 'integer'
  | 'fiat'
  | 'token'
  | 'apr'
  | 'feePercent'
  | 'weight'
  | 'priceImpact'
  | 'percentage'
  | 'slippage'
  | 'sharePercent'
  | 'stakedPercentage'
  | 'boost'
  | 'tokenRatio'

// General number formatting function.
export function fNum(format: NumberFormat, val: Numberish, opts?: FormatOpts): string {
  switch (format) {
    case 'integer':
      return integerFormat(val)
    case 'fiat':
      return fiatFormat(val, opts)
    case 'token':
      return tokenFormat(val, opts)
    case 'apr':
      return aprFormat(val, opts)
    case 'feePercent':
    case 'sharePercent':
      return feePercentFormat(val, opts)
    case 'weight':
      return weightFormat(val, opts)
    case 'stakedPercentage':
    case 'priceImpact':
      return priceImpactFormat(val)
    case 'percentage':
      return integerPercentageFormat(val)
    case 'slippage':
      return slippageFormat(val)
    case 'boost':
      return boostFormat(val)
    case 'tokenRatio':
      return tokenRatioFormat(val)
    default:
      throw new Error(`Number format not implemented: ${format}`)
  }
}

export function fNumCustom(val: Numberish, format: string): string {
  // numeral format-string replacement is not supported by Intl.
  // Keep a minimal fallback that matches the old intent as best we can:
  // if caller passes something like '0,0' or '0.000' they likely want fixed rounding.
  // For full numeral-token-string support, you'd need to re-implement numeral’s parser.
  // Here we just return a grouped integer or raw value.
  if (format === INTEGER_FORMAT) return integerFormat(val)
  if (format === BOOST_FORMAT) return boostFormat(val)
  return bn(val).toString()
}

// Edge case where we need to display 3 decimals for small amounts between 0.001 and 0.01
function requiresThreeDecimals(value: Numberish): boolean {
  return !isZero(value) && bn(value).gte(0.001) && bn(value).lt(0.01)
}

function isSmallAmount(value: Numberish): boolean {
  return !isZero(value) && bn(value).lt(AMOUNT_LOWER_THRESHOLD)
}

function isMoreThanOrEqualToAmount(value: Numberish, amount: Numberish): boolean {
  return !isZero(value) && bn(value).gte(bn(amount))
}

function isSmallPercentage(
  value: Numberish,
  { isPercentage = false }: { isPercentage?: boolean } = {}
): boolean {
  // If the value is already a percentage (like in slippageFormat) we divide by 100
  // so that slippageFormat('10') is '10%'
  const val = isPercentage ? bn(value).div(100) : bn(value)
  return !isZero(value) && val.lt(PERCENTAGE_LOWER_THRESHOLD)
}

export function isSuperSmallAmount(value: Numberish): boolean {
  return bn(value).lte(BN_LOWER_THRESHOLD)
}

export function isZero(amount: Numberish): boolean {
  return bn(amount).isZero()
}

export function isNegative(amount: Numberish): boolean {
  return bn(amount).isNegative()
}

export function isSmallUsd(value: Numberish): boolean {
  return !isZero(value) && bn(value).lt(USD_LOWER_THRESHOLD)
}

/*
  Small USD amounts crashes the the SDK remove queries,
  so we set this threshold to disable removes
 */
export function isTooSmallToRemoveUsd(value: Numberish): boolean {
  const USD_LOWER_THRESHOLD = 0.03
  return !isZero(value) && bn(value).lt(USD_LOWER_THRESHOLD)
}

export const isValidNumber = (value: string | number | undefined | null): boolean =>
  value != null && value !== '' && isNumber(toNumber(value)) && !isNaN(toNumber(value))

// Parses a fixed-point decimal string into a bigint
// If we do not have enough decimals to express the number, we truncate it
export function safeParseFixedBigInt(value: string, decimals = 0): bigint {
  value = value.split(',').join('')
  const [integer, fraction] = value.split('.')
  if (!fraction) {
    return parseUnits(value, decimals)
  }
  const safeValue = integer + '.' + fraction.slice(0, decimals)
  return parseUnits(safeValue, decimals)
}

export const isGreaterThanZeroValidation = (value: string | undefined): string | true => {
  if (value == null) return 'Amount must be greater than 0'
  return isBnParseable(value) && bn(value).gt(0) ? true : 'Amount must be greater than 0'
}

export function sum<T>(items: T[], extractFn: (item: T) => BigNumber): BigNumber {
  return items.reduce((acc, item) => {
    return acc.plus(extractFn(item))
  }, bn(0))
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const safeToNumber = (val: string | number | undefined | null): number => {
  return isValidNumber(val) ? toNumber(val) : 0
}

// take the reciprocal of a number
export function invert(value: number): number {
  return value === 0 ? 0 : 1 / value
}

// take the reciprocal of a BigNumber, returns string
export function invertNumber(value: Numberish): string {
  const bnValue = bn(value)
  return bnValue.isZero() ? '0' : bn(1).div(bnValue).toString()
}

/**
 * Formats any value for display, showing dash for falsy values (0, '0', '', undefined)
 * @param value - The value to format (string, number, or undefined)
 * @param formatter - Optional formatter function for non-falsy values
 * @param options - Options to pass to the formatter function
 * @returns Formatted display string or dash for falsy values
 */
export function formatFalsyValueAsDash(
  value: Numberish | undefined,
  formatter?: (value: Numberish, options?: any) => string,
  options?: any
): string {
  // Convert to string for falsy checks, default to empty string for undefined
  const stringValue = value?.toString() ?? ''

  // Handle undefined and empty string - always return dash
  if (value === undefined || stringValue === '') {
    return ZERO_VALUE_DASH
  }

  // Handle zero values - respect showZeroAmountAsDash option
  if (isZero(stringValue)) {
    const showZeroAmountAsDash = options?.showZeroAmountAsDash ?? false
    return showZeroAmountAsDash ? ZERO_VALUE_DASH : stringValue
  }

  // If formatter is provided, use it to format the value
  if (formatter && value) {
    return formatter(value, options)
  }

  // Otherwise return the string representation of the value
  return stringValue
}

/**
 * True when `bn()` can parse the value without throwing.
 * Prefer this over `isValidNumber` when guarding a `bn()` call:
 * `isValidNumber` uses lodash `toNumber`, whose grammar differs from BigNumber's
 * (e.g. 'Infinity' and whitespace-only strings pass `isValidNumber` but throw in `bn()`).
 */
export function isBnParseable(value: Numberish | undefined | null): boolean {
  if (value == null) return false
  try {
    bn(value)
    return true
  } catch {
    return false
  }
}
