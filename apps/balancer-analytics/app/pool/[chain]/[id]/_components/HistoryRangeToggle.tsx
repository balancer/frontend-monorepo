'use client'

/**
 * Date-range selector for the pool detail page.
 *
 * 5 options — `30d / 90d / 180d / 1y / all` — mirroring frontend-v3's
 * `PeriodSelect`. The range is server state (a `?range=` search param read
 * by `page.tsx`), not client state: clicking pushes the URL and lets the
 * server re-render with the wider snapshot range + matching event-scan
 * window.
 *
 * Sync coupling (from `page.tsx`):
 *   30d, 90d  → standard 90-day event scan, snapshots `NINETY_DAYS`
 *   180d      → fullHistory event scan, snapshots `ONE_HUNDRED_EIGHTY_DAYS`
 *   1y        → fullHistory event scan, snapshots `ONE_YEAR`
 *   all       → fullHistory event scan, snapshots `ALL_TIME`
 *
 * Triggering fullHistory for any range > 90d ensures event markers can
 * land anywhere on the visible x-axis. After the first one-time deep
 * scan (latched via `pool_sync_state.deep_synced`) every range serves
 * fast from the DB.
 *
 * Backwards compat: `?fullHistory` (legacy URL form) is treated as
 * `?range=all` by `page.tsx`.
 */

import { Box, Flex, Spinner } from '@chakra-ui/react'

export type HistoryRange = '30d' | '90d' | '180d' | '1y' | 'all'

const OPTIONS: Array<{ value: HistoryRange; label: string }> = [
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '180d', label: '180D' },
  { value: '1y', label: '1Y' },
  { value: 'all', label: 'ALL' },
]

/**
 * Controlled segmented-control. The parent (`PoolPageView`) owns the
 * navigation + pending state so a click can dim the rest of the page
 * (chart + state panel) while the server re-renders — this gives clear
 * visual feedback during the multi-second deep scan that triggers when
 * the user widens past 90 days for the first time.
 */
export function HistoryRangeToggle({
  range,
  pendingRange,
  onSelect,
}: {
  range: HistoryRange
  /** Which option is being navigated to (null = no pending nav). */
  pendingRange: HistoryRange | null
  onSelect: (next: HistoryRange) => void
}): React.JSX.Element {
  const busy = pendingRange !== null
  return (
    <Flex
      align="center"
      bg="background.level1"
      border="1px solid"
      borderColor="border.base"
      gap="0"
      opacity={busy ? 0.7 : 1}
      p="2xs"
      rounded="full"
      transition="opacity 0.15s"
    >
      {OPTIONS.map(opt => {
        const isActive = opt.value === range
        const isPendingThis = opt.value === pendingRange
        return (
          <Box
            _hover={
              isActive
                ? undefined
                : { color: 'font.primary', bg: 'background.level2' }
            }
            aria-current={isActive ? 'true' : undefined}
            aria-disabled={busy ? 'true' : undefined}
            bg={isActive ? 'background.level3' : 'transparent'}
            border="1px solid"
            borderColor={isActive ? 'border.base' : 'transparent'}
            color={isActive ? 'font.primary' : 'font.secondary'}
            cursor={busy ? 'progress' : 'pointer'}
            fontSize="xs"
            fontWeight={isActive ? 600 : 500}
            key={opt.value}
            onClick={busy ? undefined : () => onSelect(opt.value)}
            px="ms"
            py="2xs"
            role="button"
            rounded="full"
            transition="background 0.15s, color 0.15s, border-color 0.15s"
            userSelect="none"
          >
            {isPendingThis ? <Spinner size="xs" /> : opt.label}
          </Box>
        )
      })}
    </Flex>
  )
}
