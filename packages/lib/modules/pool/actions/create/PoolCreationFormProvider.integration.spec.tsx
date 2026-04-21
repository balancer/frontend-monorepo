import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { usePoolFormLogic } from './PoolCreationFormProvider'
import { clearLocalStorageMock, mockLocalStorage } from '@repo/lib/test/utils/localstorage-mock'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import {
  INITIAL_POOL_CREATION_FORM,
  INITIAL_ECLP_CONFIG,
  INITIAL_RECLAMM_CONFIG,
} from './constants'
import { act, waitFor } from '@testing-library/react'

vi.mock('next/navigation', async importOriginal => {
  const actual = await importOriginal<typeof import('next/navigation')>()
  return {
    ...actual,
    usePathname: () => '/create',
    useSearchParams: () => new URLSearchParams(),
  }
})

beforeEach(() => {
  mockLocalStorage()
})

afterAll(() => {
  clearLocalStorageMock()
})

async function renderPoolForm() {
  const rendered = testHook(() => usePoolFormLogic())
  await waitFor(() => expect(rendered.result.current.poolCreationForm.isHydrated).toBe(true))
  return rendered
}

describe('usePoolFormLogic', () => {
  describe('persistence', () => {
    it('rehydrates form values from localStorage when the hook remounts', async () => {
      const { result, unmount } = await renderPoolForm()

      act(() => {
        result.current.poolCreationForm.setValue('name', 'Persisted name')
        result.current.poolCreationForm.setValue('symbol', 'PERSIST')
        result.current.reClammConfigForm.setValue('initialTargetPrice', '42')
        result.current.eclpConfigForm.setValue('alpha', '1.5')
      })

      // Wait for debounced-ish persistence effect to flush values to localStorage
      await waitFor(() => {
        const persisted = JSON.parse(window.localStorage.getItem(LS_KEYS.PoolCreation.Form) ?? '{}')
        expect(persisted.name).toBe('Persisted name')
      })

      unmount()

      const { result: remounted } = await renderPoolForm()

      expect(remounted.current.poolCreationForm.getValues('name')).toBe('Persisted name')
      expect(remounted.current.poolCreationForm.getValues('symbol')).toBe('PERSIST')
      expect(remounted.current.reClammConfigForm.getValues('initialTargetPrice')).toBe('42')
      expect(remounted.current.eclpConfigForm.getValues('alpha')).toBe('1.5')
    })
  })

  describe('resetPoolCreationForm', () => {
    it('reverts all persistent forms, step index, and pool address to initial values', async () => {
      // Seed step index before render so useLocalStorage initializes with it
      window.localStorage.setItem(LS_KEYS.PoolCreation.StepIndex, '2')

      const { result } = await renderPoolForm()

      expect(result.current.currentStepIndex).toBe(2)

      // protocol is overridden at runtime by PoolCreationFormProvider, so capture the actual initial
      const initialProtocol = result.current.poolCreationForm.getValues('protocol')
      const dirtyPoolAddress = '0x1234567890123456789012345678901234567890'

      act(() => {
        result.current.poolCreationForm.setValue('name', 'Mutated name')
        result.current.poolCreationForm.setValue('symbol', 'MUT')
        result.current.poolCreationForm.setValue('protocol', 'CoW')
        result.current.addPoolToken()
        result.current.reClammConfigForm.setValue('initialTargetPrice', '100')
        result.current.eclpConfigForm.setValue('alpha', '1.5')
        result.current.setPoolAddress(dirtyPoolAddress)
      })

      expect(result.current.poolCreationForm.getValues('poolTokens')).toHaveLength(
        INITIAL_POOL_CREATION_FORM.poolTokens.length + 1
      )

      act(() => {
        result.current.resetPoolCreationForm()
      })

      expect(result.current.poolCreationForm.getValues()).toEqual({
        ...INITIAL_POOL_CREATION_FORM,
        protocol: initialProtocol,
      })
      expect(result.current.reClammConfigForm.getValues()).toEqual(INITIAL_RECLAMM_CONFIG)
      expect(result.current.eclpConfigForm.getValues()).toEqual(INITIAL_ECLP_CONFIG)
      expect(result.current.poolAddress).toBeUndefined()
      expect(result.current.currentStepIndex).toBe(0)

      await waitFor(() => {
        expect(JSON.parse(window.localStorage.getItem(LS_KEYS.PoolCreation.Form) ?? '{}')).toEqual({
          ...INITIAL_POOL_CREATION_FORM,
          protocol: initialProtocol,
        })
      })
      expect(
        JSON.parse(window.localStorage.getItem(LS_KEYS.PoolCreation.ReClammConfig) ?? '{}')
      ).toEqual(INITIAL_RECLAMM_CONFIG)
      expect(
        JSON.parse(window.localStorage.getItem(LS_KEYS.PoolCreation.EclpConfig) ?? '{}')
      ).toEqual(INITIAL_ECLP_CONFIG)
      expect(window.localStorage.getItem(LS_KEYS.PoolCreation.Address)).toBeNull()
      expect(window.localStorage.getItem(LS_KEYS.PoolCreation.StepIndex)).toBe('0')
    })
  })

  describe('invertGyroEclpPriceParams', () => {
    it('inverts alpha/beta/peakPrice, swaps s<->c, preserves lambda, and reverses poolTokens', async () => {
      const { result } = await renderPoolForm()

      const tokenA = { ...INITIAL_POOL_CREATION_FORM.poolTokens[0], weight: '50' }
      const tokenB = { ...INITIAL_POOL_CREATION_FORM.poolTokens[1], weight: '50' }

      act(() => {
        result.current.poolCreationForm.setValue('poolTokens', [tokenA, tokenB])
        result.current.eclpConfigForm.setValue('alpha', '2')
        result.current.eclpConfigForm.setValue('beta', '4')
        result.current.eclpConfigForm.setValue('peakPrice', '5')
        result.current.eclpConfigForm.setValue('s', '0.1')
        result.current.eclpConfigForm.setValue('c', '0.9')
        result.current.eclpConfigForm.setValue('lambda', '100')
      })

      act(() => {
        result.current.invertGyroEclpPriceParams()
      })

      const eclp = result.current.eclpConfigForm.getValues()
      // alpha<->beta and peakPrice are inverted (1/x); compare numerically to avoid coupling to NUM_FORMAT
      expect(Number(eclp.alpha)).toBeCloseTo(0.25)
      expect(Number(eclp.beta)).toBeCloseTo(0.5)
      expect(Number(eclp.peakPrice)).toBeCloseTo(0.2)
      // s and c are swapped as-is (no inversion, no reformat)
      expect(eclp.s).toBe('0.9')
      expect(eclp.c).toBe('0.1')
      // lambda is preserved
      expect(eclp.lambda).toBe('100')
      expect(result.current.poolCreationForm.getValues('poolTokens')).toEqual([tokenB, tokenA])
    })
  })

  describe('invertReClammPriceParams', () => {
    it('inverts target price, swaps min<->max with inversion, and reverses poolTokens', async () => {
      const { result } = await renderPoolForm()

      const tokenA = { ...INITIAL_POOL_CREATION_FORM.poolTokens[0], weight: 'A' }
      const tokenB = { ...INITIAL_POOL_CREATION_FORM.poolTokens[1], weight: 'B' }

      act(() => {
        result.current.poolCreationForm.setValue('poolTokens', [tokenA, tokenB])
        result.current.reClammConfigForm.setValue('initialMinPrice', '2')
        result.current.reClammConfigForm.setValue('initialMaxPrice', '8')
        result.current.reClammConfigForm.setValue('initialTargetPrice', '4')
      })

      act(() => {
        result.current.invertReClammPriceParams()
      })

      const reclamm = result.current.reClammConfigForm.getValues()
      expect(reclamm.initialMinPrice).toBe('0.125')
      expect(reclamm.initialMaxPrice).toBe('0.5')
      expect(reclamm.initialTargetPrice).toBe('0.25')

      expect(result.current.poolCreationForm.getValues('poolTokens')).toEqual([tokenB, tokenA])
    })
  })
})
