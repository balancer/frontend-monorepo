import { uniq } from 'lodash'

export function allEqual<T>(array: T[]): boolean {
  return uniq(array).length === 1
}
