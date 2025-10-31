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
    const { result } = testHook(() => usePersistentForm<TestForm>('test-key', { a: 'A', b: 'B' }))

    expect(result.current.getValues('a')).toBe('A')
    expect(result.current.getValues('b')).toBe('B')
  })

  it('should init form with date from local storage', () => {
    window.localStorage.setItem('test-key', JSON.stringify({ a: 'A', b: 'B' }))

    const { result } = testHook(() => usePersistentForm<TestForm>('test-key', {}))

    expect(result.current.getValues('a')).toBe('A')
    expect(result.current.getValues('b')).toBe('B')
  })

  it('should store a changed form value in local storage', () => {
    const { result } = testHook(() => usePersistentForm<TestForm>('test-key', { a: 'A', b: 'B' }))

    act(() => result.current.setValue('a', 'C'))

    expect((JSON.parse(window.localStorage.getItem('test-key') || '{}') as TestForm).a).toBe('C')
  })

  it('should reset to initial values', () => {
    window.localStorage.setItem('test-key', JSON.stringify({ a: 'A', b: 'B' }))
    const { result } = testHook(() => usePersistentForm<TestForm>('test-key', { a: '1', b: '2' }))

    expect(result.current.getValues('a')).toBe('A')
    expect(result.current.getValues('b')).toBe('B')

    act(() => result.current.resetToInitial())

    expect(result.current.getValues('a')).toBe('1')
    expect(result.current.getValues('b')).toBe('2')
    expect((JSON.parse(window.localStorage.getItem('test-key') || '{}') as TestForm).a).toBe('1')
    expect((JSON.parse(window.localStorage.getItem('test-key') || '{}') as TestForm).b).toBe('2')
  })
})
