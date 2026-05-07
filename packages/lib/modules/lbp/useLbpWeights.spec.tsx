import { PropsWithChildren } from 'react'
import { act } from '@testing-library/react'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { FiatFxRatesProvider } from '@repo/lib/shared/hooks/FxRatesProvider'
import { clearLocalStorageMock, mockLocalStorage } from '@repo/lib/test/utils/localstorage-mock'
import { LbpFormProvider, useLbpForm } from './LbpFormProvider'
import { useLbpWeights } from './useLbpWeights'
import { WeightAdjustmentType } from './lbp.types'

function LbpTestWrapper({ children }: PropsWithChildren) {
  return (
    <FiatFxRatesProvider data={undefined}>
      <LbpFormProvider>{children}</LbpFormProvider>
    </FiatFxRatesProvider>
  )
}

function useWeightsTestHarness() {
  const { saleStructureForm } = useLbpForm()
  return {
    weights: useLbpWeights(),
    setWeightAdjustmentType: (value: WeightAdjustmentType | undefined) => {
      saleStructureForm.setValue('weightAdjustmentType', value)
    },
    setCustomWeights: (start: number | undefined, end: number | undefined) => {
      saleStructureForm.setValue('customStartWeight', start)
      saleStructureForm.setValue('customEndWeight', end)
    },
  }
}

vi.mock('next/navigation', async importOriginal => {
  const actual = await importOriginal<typeof import('next/navigation')>()
  return {
    ...actual,
    usePathname: () => '/lbp/create',
    useSearchParams: () => new URLSearchParams(),
  }
})

beforeEach(() => {
  mockLocalStorage()
})

afterAll(() => {
  clearLocalStorageMock()
})

describe('useLbpWeights', () => {
  it('uses the 90/10 preset by default', () => {
    const { result } = testHook(() => useWeightsTestHarness(), { wrapper: LbpTestWrapper })

    expect(result.current.weights).toEqual({
      projectTokenStartWeight: 90,
      reserveTokenStartWeight: 10,
      projectTokenEndWeight: 10,
      reserveTokenEndWeight: 90,
    })
  })

  it('derives reserve weights for the 90/50 preset', () => {
    const { result } = testHook(() => useWeightsTestHarness(), { wrapper: LbpTestWrapper })

    act(() => {
      result.current.setWeightAdjustmentType(WeightAdjustmentType.LINEAR_90_50)
    })

    expect(result.current.weights).toEqual({
      projectTokenStartWeight: 90,
      reserveTokenStartWeight: 10,
      projectTokenEndWeight: 50,
      reserveTokenEndWeight: 50,
    })
  })

  it('uses custom project weights and complements them for reserve weights', () => {
    const { result } = testHook(() => useWeightsTestHarness(), { wrapper: LbpTestWrapper })

    act(() => {
      result.current.setWeightAdjustmentType(WeightAdjustmentType.CUSTOM)
      result.current.setCustomWeights(80, 35)
    })

    expect(result.current.weights).toEqual({
      projectTokenStartWeight: 80,
      reserveTokenStartWeight: 20,
      projectTokenEndWeight: 35,
      reserveTokenEndWeight: 65,
    })
  })
})
