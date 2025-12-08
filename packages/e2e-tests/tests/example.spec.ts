// Import necessary Synpress modules and setup
import { testWithSynpress } from '@synthetixio/synpress'
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright'
import basicSetup from '../test/wallet-setup/basic.setup'
import { clickButton, isButtonVisible } from '@/helpers/user.helpers'
import { setForkBalances } from '@/helpers/e2e.helpers'

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
  await setForkBalances(page, {
    chainId: 1,
    forkBalances: {
      1: [
        {
          tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
          value: '100',
        },
      ],
    },
  })

  // Create a new MetaMask instance
  const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId)

  // Navigate to the swap page
  await page.goto('http://localhost:3000/swap')

  // Click the connect button
  await page.locator('#connectButton').click()

  // Click MetaMask confirmation
  await page.locator('text=MetaMask').click()

  // Connect MetaMask to the dapp
  await metamask.switchAccount('Account 2') // anvil #3 wallet
  await metamask.connectToDapp()

  // Accept policies
  await page
    .getByRole('dialog', { name: 'Accept Balancer policies' })
    .locator('span')
    .first()
    .check()

  await page.getByRole('button', { name: 'Proceed' }).click()

  // Verify the connected account address
  await expect(page.locator('#connectedButton')).toHaveText('0x90…b906')

  await clickButton(page, 'ETH')
  await page.getByText('Wrapped Ether').click()

  await clickButton(page, 'Select token')
  await page.getByText('USDCUSDC').click()
  await page.getByRole('spinbutton', { name: 'TokenIn' }).fill('0.1')

  // need to reload the page to get the correct token balance
  // but it still looks like there is no balance?
  await page.reload()

  await clickButton(page, 'Next')

  if (await isButtonVisible(page, 'Approve WETH to swap')) {
    await clickButton(page, 'Approve WETH to swap')
  }

  await metamask.approveTokenPermission()

  await clickButton(page, 'Swap')
  await expect(page.getByText('Transaction confirmed')).toBeVisible()
  await metamask.confirmTransaction()

  await page.getByRole('button', { name: 'Swap again' }).click()

  // Additional test steps can be added here, such as:
  // - Sending transactions
  // - Interacting with smart contracts
  // - Testing dapp-specific functionality
})
