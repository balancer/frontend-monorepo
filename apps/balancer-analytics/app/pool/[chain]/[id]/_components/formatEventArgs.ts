/**
 * Shared formatter for `PoolParamEvent.args` values.
 *
 * Args land in JSONB as primitive strings/numbers/booleans regardless of
 * their on-chain type — viem-decoded BigInts get stringified by the
 * write-through layer. The renderer needs to convert back into a
 * human-readable form: scaled-percentage uints become `%`, amp values
 * become decimal numbers, unix timestamps become locale dates.
 *
 * Heuristics are arg-name-driven (no event-specific overrides) because the
 * naming across V2 and V3 is consistent (`*Percentage` for 1e18-scaled
 * fixed-point, `startValue` / `endValue` for amp, `startTime` / `endTime`
 * for unix seconds). New events using the same naming get formatted for
 * free; outliers fall back to `String(value)`.
 */

const PERCENT_NAME_REGEX = /Percentage$|FeePerc|surgeThreshold$|surgeFee$/i
const AMP_NAME_REGEX = /^(startValue|endValue|currentValue)$/
const TIME_NAME_REGEX = /^(startTime|endTime)$/

export function formatEventArgValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'true' : 'false'

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    if (PERCENT_NAME_REGEX.test(key)) {
      const n = Number(value) / 1e18
      if (Number.isFinite(n)) return `${(n * 100).toFixed(4).replace(/\.?0+$/, '')}%`
    }
    if (AMP_NAME_REGEX.test(key)) {
      // V2 + V3 amp values are scaled by 1000 (the Stable pool's
      // amplification precision). Render as a plain decimal.
      const n = Number(value) / 1000
      if (Number.isFinite(n)) return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
    }
    if (TIME_NAME_REGEX.test(key)) {
      const d = new Date(Number(value) * 1000)
      if (!isNaN(d.getTime())) {
        return d.toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      }
    }
  }

  return String(value)
}
