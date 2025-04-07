import { Address, createTestClient, http, isAddress, parseUnits } from 'viem'
import { SetBalanceMutation } from '../../anvil/useSetErc20Balance'
import { TokenBalance, TokenBalancesByChain } from './fork-options'
import { createConfig } from 'wagmi'
import { mainnet } from 'viem/chains'
import { drpcUrlByChainId } from '@repo/lib/shared/utils/rpc'

/*
  E2E dev tests use an anvil fork to impersonate and test with default anvil accounts
  This is a helper file to provide related constants and helpers
*/

export const defaultAnvilAccount = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
export const defaultAnvilForkRpcUrl = 'http://127.0.0.1:8545'

export const mainnetTest = {
  ...mainnet,
  rpcUrls: {
    default: {
      http: [defaultAnvilForkRpcUrl],
    },
  },
}

export const forkClient = createTestClient({
  // chain: mainnetTest, // TODO: check when this could be useful
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

export function resetFork(chainId: number = mainnet.id) {
  const privateKey = process.env['NEXT_PRIVATE_DRPC_KEY']
  if (!privateKey) {
    throw new Error('NEXT_PRIVATE_DRPC_KEY is missing')
  }
  return forkClient.reset({
    jsonRpcUrl: drpcUrlByChainId(chainId, privateKey),
  })
}

const storageKey = 'impersonated-address'

export function setImpersonatedAddressLS(impersonatedAddress: string) {
  if (!isLocalStorageAvailable()) return
  localStorage.setItem(storageKey, impersonatedAddress)
}

export function getSavedImpersonatedAddressLS(): Address | undefined {
  if (!isLocalStorageAvailable()) return undefined
  const result = localStorage.getItem(storageKey)
  return result && isAddress(result) ? result : undefined
}

export function clearWalletConnectConnected() {
  if (!isLocalStorageAvailable()) return
  localStorage.removeItem(storageKey)
}

function isLocalStorageAvailable() {
  return typeof localStorage !== 'undefined'
}
