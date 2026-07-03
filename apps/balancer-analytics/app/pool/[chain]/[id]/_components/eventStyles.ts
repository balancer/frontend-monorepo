/**
 * Per-event visual registry — one color + short pin label + long legend
 * label per tracked event name. Used by both the chart's `markPoint` /
 * `markLine` and the legend chip strip above the chart.
 *
 * Colors are deliberately grouped: fee-family events share a purple
 * palette, amp events use amber, paused/recovery share red/orange, surge
 * uses pink, registration uses slate. Within each family the hue varies
 * enough to distinguish at a glance.
 *
 * `pinLabel` is what appears on the in-chart pin (~5 characters max to
 * fit comfortably). `legendLabel` is the human-readable form used in the
 * chip strip and tooltips. `category` is retained for back-compat with
 * the existing markArea logic and any future grouping needs.
 */

export type EventCategory = 'fee' | 'state' | 'amp' | 'surge' | 'registration' | 'rate' | 'other'

export type EventStyle = {
  color: string
  pinLabel: string
  legendLabel: string
  category: EventCategory
}

const FALLBACK_STYLE: EventStyle = {
  color: '#94a3b8',
  pinLabel: 'EVT',
  legendLabel: 'Other',
  category: 'other',
}

export const EVENT_STYLES: Record<string, EventStyle> = {
  // ── V3 Vault swap fee ──
  SwapFeePercentageChanged: {
    color: '#9f95f0',
    pinLabel: 'FEE',
    legendLabel: 'Swap fee',
    category: 'fee',
  },

  // ── V3 Vault aggregate fees ──
  AggregateSwapFeePercentageChanged: {
    color: '#7c6ff5',
    pinLabel: 'AGG·S',
    legendLabel: 'Aggregate swap fee',
    category: 'fee',
  },
  AggregateYieldFeePercentageChanged: {
    color: '#a99af3',
    pinLabel: 'AGG·Y',
    legendLabel: 'Aggregate yield fee',
    category: 'fee',
  },

  // ── V3 ProtocolFeeController ──
  ProtocolSwapFeePercentageChanged: {
    color: '#6553e8',
    pinLabel: 'PRT·S',
    legendLabel: 'Protocol swap fee',
    category: 'fee',
  },
  ProtocolYieldFeePercentageChanged: {
    color: '#8478ec',
    pinLabel: 'PRT·Y',
    legendLabel: 'Protocol yield fee',
    category: 'fee',
  },
  PoolCreatorSwapFeePercentageChanged: {
    color: '#bcb1f7',
    pinLabel: 'CRE·S',
    legendLabel: 'Pool-creator swap fee',
    category: 'fee',
  },
  PoolCreatorYieldFeePercentageChanged: {
    color: '#cec5f8',
    pinLabel: 'CRE·Y',
    legendLabel: 'Pool-creator yield fee',
    category: 'fee',
  },
  InitialPoolAggregateSwapFeePercentage: {
    color: '#5a4ad6',
    pinLabel: 'INIT·S',
    legendLabel: 'Initial aggregate swap fee',
    category: 'fee',
  },
  InitialPoolAggregateYieldFeePercentage: {
    color: '#7a6cd6',
    pinLabel: 'INIT·Y',
    legendLabel: 'Initial aggregate yield fee',
    category: 'fee',
  },

  // ── Stable amp ramps (V2 + V3 emit identical signatures) ──
  AmpUpdateStarted: {
    color: '#f59e0b',
    pinLabel: 'AMP+',
    legendLabel: 'Amp ramp started',
    category: 'amp',
  },
  AmpUpdateStopped: {
    color: '#d97706',
    pinLabel: 'AMP×',
    legendLabel: 'Amp ramp stopped',
    category: 'amp',
  },

  // ── State changes ──
  PoolPausedStateChanged: {
    color: '#ef4444',
    pinLabel: 'PAUS',
    legendLabel: 'Paused state',
    category: 'state',
  },
  PausedStateChanged: {
    color: '#ef4444',
    pinLabel: 'PAUS',
    legendLabel: 'Paused state',
    category: 'state',
  },
  PoolRecoveryModeStateChanged: {
    color: '#f97316',
    pinLabel: 'REC',
    legendLabel: 'Recovery mode',
    category: 'state',
  },
  RecoveryModeStateChanged: {
    color: '#f97316',
    pinLabel: 'REC',
    legendLabel: 'Recovery mode',
    category: 'state',
  },

  // ── Stable Surge hook ──
  ThresholdSurgePercentageChanged: {
    color: '#ec4899',
    pinLabel: 'SRG·T',
    legendLabel: 'Surge threshold',
    category: 'surge',
  },
  MaxSurgeFeePercentageChanged: {
    color: '#db2777',
    pinLabel: 'SRG·M',
    legendLabel: 'Max surge fee',
    category: 'surge',
  },
  StableSurgeHookRegistered: {
    color: '#be185d',
    pinLabel: 'HOOK',
    legendLabel: 'Surge hook registered',
    category: 'surge',
  },

  // ── Pool registration anchors ──
  PoolRegistered: {
    color: '#64748b',
    pinLabel: 'REG',
    legendLabel: 'Pool registered',
    category: 'registration',
  },
  PoolRegisteredWithFeeController: {
    color: '#475569',
    pinLabel: 'REG·F',
    legendLabel: 'Registered with FeeController',
    category: 'registration',
  },

  // ── V2 protocol fee cache + V2 stable rate provider ──
  ProtocolFeePercentageCacheUpdated: {
    color: '#10b981',
    pinLabel: 'PFC',
    legendLabel: 'Protocol fee cache',
    category: 'rate',
  },
  TokenRateProviderSet: {
    color: '#06b6d4',
    pinLabel: 'RP·S',
    legendLabel: 'Rate provider set',
    category: 'rate',
  },
  TokenRateCacheUpdated: {
    color: '#0891b2',
    pinLabel: 'RP·U',
    legendLabel: 'Rate cache updated',
    category: 'rate',
  },
}

export function getEventStyle(eventName: string): EventStyle {
  return EVENT_STYLES[eventName] ?? FALLBACK_STYLE
}

// Display order for the legend chip strip. Events not in this list are
// appended in alphabetical order.
export const CATEGORY_ORDER: EventCategory[] = [
  'fee',
  'amp',
  'state',
  'surge',
  'rate',
  'registration',
  'other',
]
