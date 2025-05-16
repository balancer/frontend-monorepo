import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'
import fetch from 'cross-fetch'
import { apolloTestClient } from '../../../test/utils/apollo-test-client'

// Set timezone to GMT for consistent date handling in tests
process.env.TZ = 'Europe/Madrid'

/*
Using the default node-fetch in node 18 causes a viem exception in integration tests
(Expected signal to be an instanceof AbortSignal)
Replacing fetch with cross-fetch implementation solves the issue
*/
global.fetch = fetch

// Avoid using next/image in tests
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />
  },
}))

vi.mock('next/navigation', async importOriginal => {
  const actual = await importOriginal()
  return {
    // @ts-expect-error - Mocking next router
    ...actual,
    useParams: () => {
      return { variant: 'v2' }
    },
    usePathname: () => {
      return 'testPathName'
    },
  }
})

// waitFor global timeout
// https://testing-library.com/docs/dom-testing-library/api-configuration/#asyncutiltimeout
configure({ asyncUtilTimeout: 10_000 })

beforeEach(() => {
  apolloTestClient.clearStore()
})
