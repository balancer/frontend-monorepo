import { test } from '@playwright/test'
import { balWeth8020 } from '@repo/lib/modules/pool/__mocks__/pool-examples/flat'

// This test must be run before all the others
test('Wait for dev server to load page', async ({ page }) => {
  // Wait for 1 minute for the dev server to load tested pages before running the real tests
  test.setTimeout(90000)

  const poolDetailPageUrl = `http://localhost:3000/pools/ethereum/v2/${balWeth8020.poolId}`

  // Loading detail pool page to ensure the dev server is ready
  await page.goto(poolDetailPageUrl, {
    waitUntil: 'load',
  })

  await page.goto(poolDetailPageUrl + '/add-liquidity', {
    waitUntil: 'load',
  })

  await page.goto(poolDetailPageUrl + '/remove-liquidity', {
    waitUntil: 'load',
  })
})
