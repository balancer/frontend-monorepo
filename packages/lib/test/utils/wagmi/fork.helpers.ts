import { Address, createTestClient, http, parseUnits } from 'viem'
import { mainnet } from 'viem/chains'
import { SetBalanceMutation } from '../../anvil/useSetErc20Balance'
import { TokenBalance, TokenBalancesByChain } from './default-fork-balances'
import { createConfig } from 'wagmi'

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

type WagmiConfig = ReturnType<typeof createConfig>

type SetBalancesParams = {
  impersonatedAddress: Address
  wagmiConfig: WagmiConfig
  setBalance: SetBalanceMutation
  tokenBalances: TokenBalancesByChain
  chainId?: number
}
export async function setTokenBalances({
  setBalance,
  tokenBalances,
  chainId,
  impersonatedAddress,
  wagmiConfig,
}: SetBalancesParams) {
  async function setChainBalances(tokenBalances: TokenBalance[], chainId: number) {
    for (const tokenBalance of tokenBalances) {
      const value = parseUnits(tokenBalance.value, tokenBalance.decimals ?? 18)
      await setBalance.mutateAsync({
        ...tokenBalance,
        value,
        wagmiConfig,
        address: impersonatedAddress,
        chainId,
      })
    }
  }

  if (chainId) {
    return setChainBalances(tokenBalances[chainId], chainId)
  }

  // Iterate over all chains
  for (const chainId in tokenBalances) {
    await setChainBalances(tokenBalances[chainId], Number(chainId))
  }
}
