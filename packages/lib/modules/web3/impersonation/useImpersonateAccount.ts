/* eslint-disable react-hooks/exhaustive-deps */
import { shouldUseAnvilFork } from '@repo/lib/config/app.config'
import { useSetErc20Balance } from '@repo/lib/test/anvil/useSetErc20Balance'
import { defaultManualForkOptions } from '@repo/lib/test/utils/wagmi/fork-options'
import {
  forkClient,
  getSavedImpersonatedAddressLS,
  setImpersonatedAddressLS,
  setTokenBalances,
} from '@repo/lib/test/utils/wagmi/fork.helpers'
import { useEffect, useRef } from 'react'
import { Address } from 'viem'
import { useConnect } from 'wagmi'
import { impersonateWagmiConfig } from '../WagmiConfig'

export function useImpersonateAccount() {
  const { connectAsync } = useConnect()
  const setBalance = useSetErc20Balance()

  // Tracks current impersonated address stored in local storage (used to auto-reconnect)
  const storedImpersonatedAddress = useRef<Address | undefined>(undefined)
  const isReconnected = useRef(false)

  useEffect(() => {
    const impersonatedAddress = getSavedImpersonatedAddressLS()
    if (impersonatedAddress) {
      storedImpersonatedAddress.current = impersonatedAddress
    }
  }, [])

  useEffect(() => {
    if (storedImpersonatedAddress.current && !isReconnected.current) {
      isReconnected.current = true

      impersonateAccount({
        impersonatedAddress: storedImpersonatedAddress.current,
        isReconnecting: true,
      })
    }
  }, [storedImpersonatedAddress])

  return { impersonateAccount }

  async function impersonateAccount({
    impersonatedAddress,
    isReconnecting = false,
  }: {
    impersonatedAddress: Address
    isReconnecting?: boolean
  }) {
    if (!impersonatedAddress) return
    const { connectors, updatedConfig } = impersonateWagmiConfig(impersonatedAddress)
    setImpersonatedAddressLS(impersonatedAddress)

    // E2E dev tests impersonate account in the fork to be able to sign and run transactions against the anvil fork
    if (shouldUseAnvilFork) {
      await forkClient.impersonateAccount({
        address: impersonatedAddress,
      })

      // TODO: Using window to globally set the fork options from E2E tests. Explore better ways to do this.
      const chainId = window.forkOptions?.chainId ?? defaultManualForkOptions.chainId
      const forkBalances = window.forkOptions?.forkBalances ?? defaultManualForkOptions.forkBalances
      console.log('window.forkOptions', JSON.stringify(window.forkOptions, null, 2))

      console.log('🥸 Impersonating with ', {
        impersonatedAddress,
        chainId,
      })

      if (forkBalances[chainId] && !isReconnecting) {
        await setTokenBalances({
          impersonatedAddress,
          wagmiConfig: updatedConfig,
          setBalance,
          tokenBalances: forkBalances,
          chainId,
        })
      }

      // if you don't pass chainId you will be prompted to switch chain (check if it uses mainnet by default)
      await connectAsync({ connector: connectors[connectors.length - 1], chainId })
      storedImpersonatedAddress.current = undefined
    }
  }
}
