import type {} from '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/react'
import { apolloTestClient } from '../../../test/utils/apollo-test-client'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend the runner's expect without importing a separate pnpm Vitest peer instance.
expect.extend(matchers)

// Set timezone to GMT for consistent date handling in tests
process.env.TZ = 'Europe/Madrid'

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
