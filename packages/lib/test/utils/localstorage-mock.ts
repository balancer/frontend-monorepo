const originalLocalStorage = window.localStorage

export function mockLocalStorage() {
  window.localStorage = {
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
  }
}

export function clearLocalStorageMock() {
  window.localStorage = originalLocalStorage
}
