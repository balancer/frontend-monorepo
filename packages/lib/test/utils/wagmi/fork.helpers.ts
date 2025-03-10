import { createTestClient, http } from 'viem'
import { mainnet } from 'viem/chains'

/*
  E2E dev tests use an anvil fork to impersonate and test with default anvil accounts
  This is a helper file to provide related constants and helpers
*/

export const defaultAnvilAccount = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
export const defaultAnvilForkRpcUrl = 'http://127.0.0.1:8545'

export const forkClient = createTestClient({
  chain: mainnet,
  mode: 'anvil',
  transport: http(defaultAnvilForkRpcUrl),
})
