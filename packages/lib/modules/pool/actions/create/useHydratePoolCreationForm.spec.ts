import { describe, expect, it, vi, beforeEach } from 'vitest'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { useHydratePoolCreationForm } from './useHydratePoolCreationForm'

vi.mock('./useUninitializedPool', () => ({
  useUninitializedPool: vi.fn(),
}))

vi.mock('./PoolCreationFormProvider', () => ({
  usePoolCreationForm: vi.fn(),
}))

describe('useHydratePoolCreationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('clears pool address when areAllParamsDefined becomes true', async () => {
    const { useUninitializedPool } = await import('./useUninitializedPool')
    const { usePoolCreationForm } = await import('./PoolCreationFormProvider')

    const setPoolAddress = vi.fn()

    ;(useUninitializedPool as ReturnType<typeof vi.fn>).mockReturnValue({
      poolFormData: null,
      autoRangeFormData: null,
      eclpFormData: null,
      isLoadingPool: false,
      shouldHydratePoolCreationForm: false,
      areAllParamsDefined: true,
      poolAddressParam: undefined,
    })
    ;(usePoolCreationForm as ReturnType<typeof vi.fn>).mockReturnValue({
      poolCreationForm: { reset: vi.fn() },
      setPoolAddress,
      autoRangeConfigForm: { reset: vi.fn() },
      eclpConfigForm: { reset: vi.fn() },
      goToLastStep: vi.fn(),
    })

    testHook(() => useHydratePoolCreationForm())
    expect(setPoolAddress).toHaveBeenCalledWith(undefined)
  })

  it('resets all forms and navigates to last step when hydration conditions are met', async () => {
    const { useUninitializedPool } = await import('./useUninitializedPool')
    const { usePoolCreationForm } = await import('./PoolCreationFormProvider')

    const mockPoolFormData = { name: 'Test Pool', symbol: 'TEST' }
    const mockAutoRangeFormData = { initialTargetPrice: '100' }
    const mockEclpFormData = { alpha: '1.5' }

    const poolCreationFormReset = vi.fn()
    const autoRangeConfigFormReset = vi.fn()
    const eclpConfigFormReset = vi.fn()
    const setPoolAddress = vi.fn()
    const goToLastStep = vi.fn()

    ;(useUninitializedPool as ReturnType<typeof vi.fn>).mockReturnValue({
      poolFormData: mockPoolFormData,
      autoRangeFormData: mockAutoRangeFormData,
      eclpFormData: mockEclpFormData,
      isLoadingPool: false,
      shouldHydratePoolCreationForm: true,
      areAllParamsDefined: false,
      poolAddressParam: '0xpoolAddress123',
    })
    ;(usePoolCreationForm as ReturnType<typeof vi.fn>).mockReturnValue({
      poolCreationForm: { reset: poolCreationFormReset },
      setPoolAddress,
      autoRangeConfigForm: { reset: autoRangeConfigFormReset },
      eclpConfigForm: { reset: eclpConfigFormReset },
      goToLastStep,
    })

    testHook(() => useHydratePoolCreationForm())
    await waitFor(() => expect(poolCreationFormReset).toHaveBeenCalled())

    expect(poolCreationFormReset).toHaveBeenCalledWith(mockPoolFormData)
    expect(autoRangeConfigFormReset).toHaveBeenCalledWith(mockAutoRangeFormData)
    expect(eclpConfigFormReset).toHaveBeenCalledWith(mockEclpFormData)
    expect(setPoolAddress).toHaveBeenCalledWith('0xpoolAddress123')
    expect(goToLastStep).toHaveBeenCalled()
  })

  it('does not reset forms while still loading', async () => {
    const { useUninitializedPool } = await import('./useUninitializedPool')
    const { usePoolCreationForm } = await import('./PoolCreationFormProvider')

    const poolCreationFormReset = vi.fn()

    ;(useUninitializedPool as ReturnType<typeof vi.fn>).mockReturnValue({
      poolFormData: { name: 'Test' },
      autoRangeFormData: null,
      eclpFormData: null,
      isLoadingPool: true,
      shouldHydratePoolCreationForm: true,
      areAllParamsDefined: false,
      poolAddressParam: undefined,
    })
    ;(usePoolCreationForm as ReturnType<typeof vi.fn>).mockReturnValue({
      poolCreationForm: { reset: poolCreationFormReset },
      setPoolAddress: vi.fn(),
      autoRangeConfigForm: { reset: vi.fn() },
      eclpConfigForm: { reset: vi.fn() },
      goToLastStep: vi.fn(),
    })

    testHook(() => useHydratePoolCreationForm())
    expect(poolCreationFormReset).not.toHaveBeenCalled()
  })

  it('reacts to changes in shouldHydratePoolCreationForm via rerender', async () => {
    const { useUninitializedPool } = await import('./useUninitializedPool')
    const { usePoolCreationForm } = await import('./PoolCreationFormProvider')

    const poolCreationFormReset = vi.fn()
    const setPoolAddress = vi.fn()
    const goToLastStep = vi.fn()

    ;(usePoolCreationForm as ReturnType<typeof vi.fn>).mockReturnValue({
      poolCreationForm: { reset: poolCreationFormReset },
      setPoolAddress,
      autoRangeConfigForm: { reset: vi.fn() },
      eclpConfigForm: { reset: vi.fn() },
      goToLastStep,
    })

    const mockImpl = vi.fn(() => ({
      poolFormData: { name: 'Test' },
      autoRangeFormData: null,
      eclpFormData: null,
      isLoadingPool: false,
      shouldHydratePoolCreationForm: false,
      areAllParamsDefined: false,
      poolAddressParam: undefined,
    }))

    ;(useUninitializedPool as ReturnType<typeof vi.fn>).mockImplementation(mockImpl)

    const { rerender } = testHook(() => useHydratePoolCreationForm())
    expect(poolCreationFormReset).not.toHaveBeenCalled()

    mockImpl.mockReturnValueOnce({
      poolFormData: { name: 'Test' },
      autoRangeFormData: null,
      eclpFormData: null,
      isLoadingPool: false,
      shouldHydratePoolCreationForm: true,
      areAllParamsDefined: false,
      poolAddressParam: undefined,
    })

    rerender()

    await waitFor(() => {
      expect(poolCreationFormReset).toHaveBeenCalledWith({ name: 'Test' })
    })
  })
})
