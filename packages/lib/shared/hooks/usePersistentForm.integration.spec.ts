import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { usePersistentForm } from './usePersistentForm'
import { clearLocalStorageMock, mockLocalStorage } from '@repo/lib/test/utils/localstorage-mock'
import { act } from '@testing-library/react'

type TestForm = {
  a: string
  b: string
}

beforeEach(() => {
  mockLocalStorage()
})

afterAll(() => {
  clearLocalStorageMock()
})

describe('usePersistentForm', () => {
  it('should init the form with the default values', () => {
    const { result } = testHook(() =>
      usePersistentForm<TestForm>('test-key', { a: 'DEFAULT_A', b: 'DEFAULT_B' })
    )

    expect(result.current.getValues('a')).toBe('DEFAULT_A')
    expect(result.current.getValues('b')).toBe('DEFAULT_B')
  })

  it('should init form with data from local storage', () => {
    window.localStorage.setItem('test-key', JSON.stringify({ a: 'FROM_LS_A', b: 'FROM_LS_B' }))

    const { result } = testHook(() => usePersistentForm<TestForm>('test-key', {}))

    expect(result.current.getValues('a')).toBe('FROM_LS_A')
    expect(result.current.getValues('b')).toBe('FROM_LS_B')
  })

  it('should store a changed form value in local storage', () => {
    const { result } = testHook(() =>
      usePersistentForm<TestForm>('test-key', { a: 'DEFAULT_A', b: 'DEFAULT_B' })
    )

    act(() => result.current.setValue('a', 'C'))

    expect((JSON.parse(window.localStorage.getItem('test-key') || '{}') as TestForm).a).toBe('C')
  })

  it('should reset to initial values', () => {
    window.localStorage.setItem('test-key', JSON.stringify({ a: 'FROM_LS_A', b: 'FROM_LS_B' }))
    const { result } = testHook(() =>
      usePersistentForm<TestForm>('test-key', { a: 'DEFAULT_A', b: 'DEFAULT_B' })
    )

    expect(result.current.getValues('a')).toBe('FROM_LS_A')
    expect(result.current.getValues('b')).toBe('FROM_LS_B')

    act(() => result.current.resetToInitial())

    expect(result.current.getValues('a')).toBe('DEFAULT_A')
    expect(result.current.getValues('b')).toBe('DEFAULT_B')
    expect((JSON.parse(window.localStorage.getItem('test-key') || '{}') as TestForm).a).toBe(
      'DEFAULT_A'
    )
    expect((JSON.parse(window.localStorage.getItem('test-key') || '{}') as TestForm).b).toBe(
      'DEFAULT_B'
    )
  })
})
