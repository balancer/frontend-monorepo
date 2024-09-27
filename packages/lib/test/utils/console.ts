import { isString } from 'lodash'
import { inspect } from 'util'
import { vi as vitest } from 'vitest'

export function silenceConsoleLog(vi: typeof vitest, silenceRulesCallback: (s: string) => boolean) {
  const originalConsoleLog = console.log
  return vi.spyOn(console, 'log').mockImplementation((message, optionalParams) => {
    if (isString(message) && silenceRulesCallback(message)) return

    optionalParams ? originalConsoleLog(message, optionalParams) : originalConsoleLog(message)
  })
}

export function logRawObject(reactiveObject: object) {
  console.log(inspect(reactiveObject))
}
