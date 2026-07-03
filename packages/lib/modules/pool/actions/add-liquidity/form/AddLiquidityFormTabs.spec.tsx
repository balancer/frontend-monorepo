import { ChakraProvider } from '@chakra-ui/react'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AddLiquidityFormTabs } from './AddLiquidityFormTabs'
import { aBalWethPoolElementMock } from '@repo/lib/test/msw/builders/gqlPoolElement.builders'
import { GqlPoolTypeValues } from '@repo/lib/shared/services/api/graphql-enums'

vi.mock('@repo/lib/modules/autorange/useAutoRangeChartData', () => ({
  useAutoRangeChartData: vi.fn(),
}))

vi.mock('../AddLiquidityProvider', () => ({
  useAddLiquidity: () => ({
    clearAmountsIn: vi.fn(),
    isMinimumDepositMet: true,
    minimumDepositErrors: [],
    wantsProportional: false,
    wantsUnbalanced: false,
  }),
}))

vi.mock('../../../PoolProvider', () => ({
  usePool: () => ({
    isLoading: false,
    pool: buildReclammPool(),
  }),
}))

vi.mock('@repo/lib/shared/hooks/useCurrency', () => ({
  useCurrency: () => ({ toCurrency: (v: number) => `$${v}` }),
}))

vi.mock('@repo/lib/modules/eclp/hooks/useGetECLPLiquidityProfile', () => ({
  useGetECLPLiquidityProfile: () => ({ poolIsInRange: true }),
}))

vi.mock('@repo/lib/modules/hooks/stable-surge/useStableSurgeMetrics', () => ({
  useStableSurgeMetrics: () => ({ surging: false }),
}))

vi.mock('./TokenInputsMaybeProportional', () => ({
  TokenInputsMaybeProportional: () => null,
}))

vi.mock('../MinimumDepositErrorsAlert', () => ({
  MinimumDepositErrorsAlert: () => null,
}))

import { useAutoRangeChartData } from '@repo/lib/modules/autorange/useAutoRangeChartData'

function buildReclammPool() {
  const pool = aBalWethPoolElementMock()
  pool.type = GqlPoolTypeValues.Reclamm
  return pool
}

const defaultProps = {
  totalUSDValue: '100',
  nestedAddLiquidityEnabled: false,
  tabIndex: 0,
  setFlexibleTab: vi.fn(),
  setProportionalTab: vi.fn(),
  setUnbalancedTab: vi.fn(),
  wantsUnbalanced: true,
}

function renderTabs(props = defaultProps) {
  return render(
    <ChakraProvider>
      <AddLiquidityFormTabs {...props} />
    </ChakraProvider>
  )
}

describe('AddLiquidityFormTabs for RECLAMM pools', () => {
  it('enables the Unbalanced tab when pool is within target range', () => {
    vi.mocked(useAutoRangeChartData).mockReturnValue({
      isPoolWithinTargetRange: true,
      isPoolWithinRange: true,
      maxPriceValue: 1,
      minPriceValue: 0,
      lowerMarginValue: 0.2,
      upperMarginValue: 0.8,
      currentPriceValue: 0.5,
      marginValue: 20,
      poolCenteredness: 0.5,
      isPoolAboveCenter: false,
      isLoading: false,
    })

    renderTabs()

    const unbalancedTab = document.querySelector('[data-id="add-liquidity-tab-unbalanced"]')
    expect(unbalancedTab).toBeTruthy()
    expect(unbalancedTab).not.toHaveAttribute('disabled')
    expect(unbalancedTab).not.toHaveAttribute('aria-disabled', 'true')
  })

  it('disables the Unbalanced tab when pool is readjusting (in range but not in target range)', () => {
    vi.mocked(useAutoRangeChartData).mockReturnValue({
      isPoolWithinTargetRange: false,
      isPoolWithinRange: true,
      maxPriceValue: 1,
      minPriceValue: 0,
      lowerMarginValue: 0.2,
      upperMarginValue: 0.8,
      currentPriceValue: 0.15,
      marginValue: 20,
      poolCenteredness: 0.3,
      isPoolAboveCenter: false,
      isLoading: false,
    })

    renderTabs()

    const unbalancedTab = document.querySelector('[data-id="add-liquidity-tab-unbalanced"]')
    expect(unbalancedTab).toBeTruthy()
    expect(unbalancedTab).toHaveAttribute('disabled')
  })

  it('disables the Unbalanced tab when pool is out of range', () => {
    vi.mocked(useAutoRangeChartData).mockReturnValue({
      isPoolWithinTargetRange: false,
      isPoolWithinRange: false,
      maxPriceValue: 1,
      minPriceValue: 0,
      lowerMarginValue: 0.2,
      upperMarginValue: 0.8,
      currentPriceValue: 1.5,
      marginValue: 20,
      poolCenteredness: 0.1,
      isPoolAboveCenter: true,
      isLoading: false,
    })

    renderTabs()

    const unbalancedTab = document.querySelector('[data-id="add-liquidity-tab-unbalanced"]')
    expect(unbalancedTab).toBeTruthy()
    expect(unbalancedTab).toHaveAttribute('disabled')
  })

  it('disables the Unbalanced tab when chart data is not yet available', () => {
    vi.mocked(useAutoRangeChartData).mockReturnValue(undefined)

    renderTabs()

    const unbalancedTab = document.querySelector('[data-id="add-liquidity-tab-unbalanced"]')
    expect(unbalancedTab).toBeTruthy()
    expect(unbalancedTab).toHaveAttribute('disabled')
  })
})
