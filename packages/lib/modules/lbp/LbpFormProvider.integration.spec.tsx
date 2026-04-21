import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { useLbpFormLogic } from './LbpFormProvider'
import { clearLocalStorageMock, mockLocalStorage } from '@repo/lib/test/utils/localstorage-mock'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { FiatFxRatesProvider } from '@repo/lib/shared/hooks/FxRatesProvider'
import { INITIAL_SALE_STRUCTURE, INITIAL_PROJECT_INFO } from './constants.lbp'
import { act, waitFor } from '@testing-library/react'
import { PropsWithChildren } from 'react'

function LbpTestWrapper({ children }: PropsWithChildren) {
  return <FiatFxRatesProvider data={undefined}>{children}</FiatFxRatesProvider>
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

async function renderLbpForm() {
  const rendered = testHook(() => useLbpFormLogic(), { wrapper: LbpTestWrapper })
  await waitFor(() => {
    expect(rendered.result.current.saleStructureForm.isHydrated).toBe(true)
    expect(rendered.result.current.projectInfoForm.isHydrated).toBe(true)
  })
  return rendered
}

describe('useLbpFormLogic', () => {
  describe('persistence', () => {
    it('rehydrates form values and pool address from localStorage when the hook remounts', async () => {
      const { result, unmount } = await renderLbpForm()

      const dirtyPoolAddress = '0x1234567890123456789012345678901234567890'

      act(() => {
        result.current.saleStructureForm.setValue('saleTokenAmount', '250')
        result.current.saleStructureForm.setValue(
          'launchTokenAddress',
          '0xba100000625a3754423978a60c9317c58a424e3d'
        )
        result.current.projectInfoForm.setValue('name', 'Persisted project')
        result.current.projectInfoForm.setValue('description', 'Persisted description')
        result.current.setPoolAddress(dirtyPoolAddress)
      })

      await waitFor(() => {
        const persisted = JSON.parse(
          window.localStorage.getItem(LS_KEYS.LbpConfig.SaleStructure) ?? '{}'
        )
        expect(persisted.saleTokenAmount).toBe('250')
      })

      unmount()

      const { result: remounted } = await renderLbpForm()

      expect(remounted.current.saleStructureForm.getValues('saleTokenAmount')).toBe('250')
      expect(remounted.current.saleStructureForm.getValues('launchTokenAddress')).toBe(
        '0xba100000625a3754423978a60c9317c58a424e3d'
      )
      expect(remounted.current.projectInfoForm.getValues('name')).toBe('Persisted project')
      expect(remounted.current.projectInfoForm.getValues('description')).toBe(
        'Persisted description'
      )
      expect(remounted.current.poolAddress).toBe(dirtyPoolAddress)
    })
  })

  describe('resetLbpCreation', () => {
    it('reverts sale structure, project info, step index, and pool address to initial values', async () => {
      // Seed step index before render so useLocalStorage initializes with it
      window.localStorage.setItem(LS_KEYS.LbpConfig.StepIndex, '2')
      window.localStorage.setItem(LS_KEYS.LbpConfig.IsMetadataSaved, 'true')

      const { result } = await renderLbpForm()

      expect(result.current.currentStepIndex).toBe(2)

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

      act(() => {
        result.current.resetLbpCreation()
      })

      expect(result.current.saleStructureForm.getValues()).toEqual(INITIAL_SALE_STRUCTURE)
      expect(result.current.projectInfoForm.getValues()).toEqual(INITIAL_PROJECT_INFO)
      expect(result.current.poolAddress).toBeUndefined()
      expect(result.current.currentStepIndex).toBe(0)

      // All persisted keys should reflect initial values (or be cleared for poolAddress)
      await waitFor(() => {
        expect(
          JSON.parse(window.localStorage.getItem(LS_KEYS.LbpConfig.SaleStructure) ?? '{}')
        ).toEqual(INITIAL_SALE_STRUCTURE)
      })
      expect(
        JSON.parse(window.localStorage.getItem(LS_KEYS.LbpConfig.ProjectInfo) ?? '{}')
      ).toEqual(INITIAL_PROJECT_INFO)
      expect(window.localStorage.getItem(LS_KEYS.LbpConfig.PoolAddress)).toBeNull()
      expect(window.localStorage.getItem(LS_KEYS.LbpConfig.StepIndex)).toBe('0')
      expect(window.localStorage.getItem(LS_KEYS.LbpConfig.IsMetadataSaved)).toBe('false')
    })
  })

  describe('isProjectInfoLocked', () => {
    it('is false initially and becomes true once a pool address is set', async () => {
      const { result } = await renderLbpForm()

      expect(result.current.isProjectInfoLocked).toBe(false)

      act(() => {
        result.current.setPoolAddress('0x1234567890123456789012345678901234567890')
      })

      expect(result.current.isProjectInfoLocked).toBe(true)

      act(() => {
        result.current.setPoolAddress(undefined)
      })

      expect(result.current.isProjectInfoLocked).toBe(false)
    })
  })
})
