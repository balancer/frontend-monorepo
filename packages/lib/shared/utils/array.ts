import { uniq } from 'lodash'

export function allEqual<T>(array: T[]): boolean {
  return uniq(array).length === 1
}

export function hasDefinedValues<T>(array: T[]) {
  return array.filter(value => value !== undefined).length > 0
}
