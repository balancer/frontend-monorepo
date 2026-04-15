import { uniq } from 'lodash'

export function allEqual<T>(array: T[]): boolean {
  return uniq(array).length === 1
}

export function hasDefinedValues<T>(array: T[]) {
  return array.filter(value => value !== undefined).length > 0
}

export const isEmpty = hasDefinedValues

// Split array into chunks of specified size
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}
