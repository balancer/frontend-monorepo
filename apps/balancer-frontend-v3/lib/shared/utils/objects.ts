/**
 * Given an object like:
 *
 *    const obj = { Address1: { ADDRESS2: true } }
 *
 * converts all its keys to lowercase:
 *
 *    { address1: { address2: true } }
 *
 * User by config files to enable non-case-sensitive lookups.
 */
export function convertHexToLowerCase<T>(config: T): T {
  const newConfig: Record<any, any> = {}

  for (const key in config) {
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      const value = config[key]
      const lowercaseKey = isHex(key) ? key.toLowerCase() : key

      if (typeof value === 'string' && isHex(value)) {
        newConfig[lowercaseKey] = value.toLowerCase()
      } else if (Array.isArray(value)) {
        newConfig[lowercaseKey] = value.map(item =>
          typeof item === 'string' && isHex(item) ? item.toLowerCase() : item
        )
      } else if (typeof value === 'object') {
        newConfig[lowercaseKey] = convertHexToLowerCase(value)
      } else {
        newConfig[lowercaseKey] = value
      }
    }
  }

  return newConfig as T
}

function isHex(s: string) {
  return s.startsWith('0x')
}
