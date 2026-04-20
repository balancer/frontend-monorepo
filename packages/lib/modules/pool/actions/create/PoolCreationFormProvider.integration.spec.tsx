import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { usePoolFormLogic } from './PoolCreationFormProvider'
import { clearLocalStorageMock, mockLocalStorage } from '@repo/lib/test/utils/localstorage-mock'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { act, waitFor } from '@testing-library/react'

vi.mock('next/navigation', async importOriginal => {
  const actual = await importOriginal<typeof import('next/navigation')>()
  return {
    ...actual,
    useParams: () => ({ variant: 'v2' }),
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

describe('usePoolFormLogic', () => {
  describe('resetPoolCreationForm', () => {
    it('reverts all persistent forms, step index, and pool address to initial values', async () => {
      const { result } = testHook(() => usePoolFormLogic())

      await waitFor(() => expect(result.current.poolCreationForm.isHydrated).toBe(true))

      const dirtyPoolAddress = '0x1234567890123456789012345678901234567890'

      act(() => {
        result.current.poolCreationForm.setValue('name', 'Mutated name')
        result.current.poolCreationForm.setValue('symbol', 'MUT')
        result.current.reClammConfigForm.setValue('initialTargetPrice', '100')
        result.current.eclpConfigForm.setValue('alpha', '1.5')
        result.current.setPoolAddress(dirtyPoolAddress)
      })

      window.localStorage.setItem(LS_KEYS.PoolCreation.StepIndex, '2')

      act(() => {
        result.current.resetPoolCreationForm()
      })

      expect(result.current.poolCreationForm.getValues('name')).toBe('')
      expect(result.current.poolCreationForm.getValues('symbol')).toBe('')
      expect(result.current.reClammConfigForm.getValues('initialTargetPrice')).toBe('')
      expect(result.current.eclpConfigForm.getValues('alpha')).toBe('')
      expect(result.current.poolAddress).toBeUndefined()
      expect(window.localStorage.getItem(LS_KEYS.PoolCreation.StepIndex)).toBe('0')
    })
  })
})
