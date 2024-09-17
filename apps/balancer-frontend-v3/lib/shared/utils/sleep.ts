import { act } from '@testing-library/react'

export async function sleep(time: number) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

// Awaits in the context of a react hook test
export async function actSleep(ms: number) {
  return act(async () => {
    await sleep(ms)
  })
}
