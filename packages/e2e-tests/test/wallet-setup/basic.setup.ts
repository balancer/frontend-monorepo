// Import necessary Synpress modules
import { defineWalletSetup } from '@synthetixio/synpress'
import { MetaMask } from '@synthetixio/synpress/playwright'

// Define a test seed phrase and password
const SEED_PHRASE = 'test test test test test test test test test test test junk'
const PASSWORD = 'Tester@1234'

// Define the basic wallet setup
export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  // Create a new MetaMask instance
  const metamask = new MetaMask(context, walletPage, PASSWORD)

  // Import the wallet using the seed phrase
  await metamask.importWallet(SEED_PHRASE)

  // anvil #3 wallet
  await metamask.importWalletFromPrivateKey(
    '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
  )

  await metamask.addNetwork({
    name: 'Local Anvil Fork',
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 1,
    symbol: 'ETH',
  })

  await metamask.switchNetwork('Local Anvil Fork', true)

  // Additional setup steps can be added here, such as:
  // - Adding custom networks
  // - Importing tokens
  // - Setting up specific account states
})
