import { differenceInDays, format } from 'date-fns'

/**
 * Formats date axis labels dynamically based on the total date range
 * @param value - Unix timestamp in milliseconds
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @returns Formatted date string
 */
export function formatDateAxisLabel(value: number, startDate: Date, endDate: Date): string {
  const totalDays = differenceInDays(endDate, startDate)
  const date = new Date(value)

  // Dynamic formatting based on date range
  if (totalDays <= 7) {
    // 5-7 days: Show "Apr 9" for each day
    return format(date, 'MMM d')
  } else if (totalDays <= 30) {
    // 1-4 weeks: Show "Apr 9" with auto spacing
    return format(date, 'MMM d')
  } else if (totalDays <= 90) {
    // 1-3 months: Show "Apr 9" with wider spacing
    return format(date, 'MMM d')
  } else if (totalDays <= 365) {
    // 3-12 months: Show "Apr" for months
    return format(date, 'MMM')
  } else {
    // > 1 year: Show "2024-04" for year-month
    return format(date, 'yyyy-MM')
  }
}
