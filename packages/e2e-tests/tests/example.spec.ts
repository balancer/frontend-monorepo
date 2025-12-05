// Import necessary Synpress modules and setup
import { testWithSynpress } from '@synthetixio/synpress'
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright'
import basicSetup from '../test/wallet-setup/basic.setup'

// Create a test instance with Synpress and MetaMask fixtures
const test = testWithSynpress(metaMaskFixtures(basicSetup))

// Extract expect function from test
const { expect } = test

// Define a basic test case
test('should connect wallet to the MetaMask Test Dapp', async ({
  context,
  page,
  metamaskPage,
  extensionId,
}) => {
  // Create a new MetaMask instance
  const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId)

  // Navigate to the homepage
  await page.goto('http://localhost:3000/pools')

  // Click the connect button
  await page.locator('#connectButton').click()

  // Click MetaMask confirmation
  await page.locator('text=MetaMask').click()

  // Connect MetaMask to the dapp
  await metamask.connectToDapp()

  // Accept policies
  await page
    .getByRole('dialog', { name: 'Accept Balancer policies' })
    .locator('span')
    .first()
    .check()

  await page.getByRole('button', { name: 'Proceed' }).click()

  // Verify the connected account address
  await expect(page.locator('#connectedButton')).toHaveText('0xf3...2266')

  // Additional test steps can be added here, such as:
  // - Sending transactions
  // - Interacting with smart contracts
  // - Testing dapp-specific functionality
})
