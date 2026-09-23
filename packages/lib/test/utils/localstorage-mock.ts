const originalLocalStorageDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage')

// Vitest 5 propagates global assignments to the underlying DOM implementation.
// happy-dom's GlobalWindow exposes `localStorage` as a getter-only property, so
// a plain `window.localStorage = ...` throws. Redefine the property instead.
function setLocalStorage(value: Storage) {
  Object.defineProperty(window, 'localStorage', {
    value,
    configurable: true,
    writable: true,
  })
}

export function mockLocalStorage() {
  setLocalStorage({
    get length() {
      return Object.keys(this.store).length
    },
    store: {},
    getItem(key) {
      return this.store[key] ?? null
    },
    setItem(key, value) {
      this.store[key] = value
    },
    removeItem(key) {
      delete this.store[key]
    },
    clear() {
      this.store = {}
    },
    key(i) {
      const keys = Object.keys(this.store)
      return keys[i] || null
    },
  } as Storage)
}

export function clearLocalStorageMock() {
  if (originalLocalStorageDescriptor) {
    Object.defineProperty(window, 'localStorage', originalLocalStorageDescriptor)
  }
}
