import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { useLbpFormLogic } from './LbpFormProvider'
import { clearLocalStorageMock, mockLocalStorage } from '@repo/lib/test/utils/localstorage-mock'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { FiatFxRatesProvider } from '@repo/lib/shared/hooks/FxRatesProvider'
import { act, waitFor } from '@testing-library/react'
import { PropsWithChildren } from 'react'

function LbpTestWrapper({ children }: PropsWithChildren) {
  return <FiatFxRatesProvider data={undefined}>{children}</FiatFxRatesProvider>
}

vi.mock('next/navigation', async importOriginal => {
  const actual = await importOriginal<typeof import('next/navigation')>()
  return {
    ...actual,
    useParams: () => ({ variant: 'v2' }),
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

describe('useLbpFormLogic', () => {
  describe('resetLbpCreation', () => {
    it('reverts sale structure, project info, step index, and pool address to initial values', async () => {
      const { result } = testHook(() => useLbpFormLogic(), { wrapper: LbpTestWrapper })

      await waitFor(() => {
        expect(result.current.saleStructureForm.isHydrated).toBe(true)
        expect(result.current.projectInfoForm.isHydrated).toBe(true)
      })

      const dirtyPoolAddress = '0x1234567890123456789012345678901234567890'

      act(() => {
        result.current.saleStructureForm.setValue(
          'launchTokenAddress',
          '0xba100000625a3754423978a60c9317c58a424e3d'
        )
        result.current.saleStructureForm.setValue('saleTokenAmount', '100')
        result.current.projectInfoForm.setValue('name', 'The Phoenix Project')
        result.current.projectInfoForm.setValue('description', 'Rises from the ashes')
        result.current.setPoolAddress(dirtyPoolAddress)
      })

      window.localStorage.setItem(LS_KEYS.LbpConfig.StepIndex, '2')
      window.localStorage.setItem(LS_KEYS.LbpConfig.IsMetadataSaved, 'true')

      act(() => {
        result.current.resetLbpCreation()
      })

      expect(result.current.saleStructureForm.getValues('launchTokenAddress')).toBe('')
      expect(result.current.saleStructureForm.getValues('saleTokenAmount')).toBe('')
      expect(result.current.projectInfoForm.getValues('name')).toBe('')
      expect(result.current.projectInfoForm.getValues('description')).toBe('')
      expect(result.current.poolAddress).toBeUndefined()
      expect(window.localStorage.getItem(LS_KEYS.LbpConfig.StepIndex)).toBe('0')
      expect(window.localStorage.getItem(LS_KEYS.LbpConfig.IsMetadataSaved)).toBe('false')
    })
  })
})
