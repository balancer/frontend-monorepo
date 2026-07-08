// Number formatters shared across the hero strip and the inline KPI cells.
// Kept in one file so they stay in lockstep — a hero showing $5.4B and a
// strip cell showing $5.42B would read as a bug.

export const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n || 0)
