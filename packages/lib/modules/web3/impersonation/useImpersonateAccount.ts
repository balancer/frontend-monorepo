/* eslint-disable react-hooks/exhaustive-deps */
import { shouldUseAnvilFork } from '@repo/lib/config/app.config'
import { useSetErc20Balance } from '@repo/lib/test/anvil/useSetErc20Balance'
import { defaultManualForkOptions } from '@repo/lib/test/utils/wagmi/fork-options'
import {
  forkClient,
  getSavedImpersonatedAddressLS,
  publicForkClient,
  setImpersonatedAddressLS,
  setTokenBalances,
} from '@repo/lib/test/utils/wagmi/fork.helpers'
import { useEffect, useRef } from 'react'
import { Address } from 'viem'
import { useConnect } from 'wagmi'
import { impersonateWagmiConfig, WagmiConfig } from '../WagmiConfig'
import { useWagmiConfig } from '../WagmiConfigProvider'
import { queryClient } from '@repo/lib/shared/app/react-query.provider'

export function useImpersonateAccount() {
  const { connectAsync } = useConnect()
  const { wagmiConfig } = useWagmiConfig()
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

  return { impersonateAccount, reset, mineBlockWithTimestamp }

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

      const { chainId } = await getOptions()

      console.log('🥸 Impersonating with ', {
        impersonatedAddress,
        chainId,
      })

      await setForkBalances({
        impersonatedAddress,
        wagmiConfig: updatedConfig,
        isReconnecting,
      })

      // if you don't pass chainId you will be prompted to switch chain (check if it uses mainnet by default)
      await connectAsync({ connector: connectors[connectors.length - 1], chainId })
    }
  }

  async function reset() {
    if (!storedImpersonatedAddress.current) {
      return console.log('Cannot reset cause there is no stored impersonated address')
    }
    // We don't pass jsonrpcUrl so it will reset to the initial used state
    forkClient.reset()
    await setForkBalances({
      impersonatedAddress: storedImpersonatedAddress.current as Address,
      wagmiConfig,
    })
    queryClient.invalidateQueries()
  }

  async function getOptions() {
    /*
      Using window to globally set the fork options from E2E tests. Explore better ways to do this.
      Getting chain id from the current running fork until we support multiple forks
    */
    const runningForkChain = await publicForkClient.getChainId()
    // const chainId = window.forkOptions?.chainId ?? defaultManualForkOptions.chainId
    const chainId = runningForkChain
    const forkBalances = window.forkOptions?.forkBalances ?? defaultManualForkOptions.forkBalances
    // console.log('window.forkOptions', JSON.stringify(window.forkOptions, null, 2))
    return { chainId, forkBalances }
  }

  async function setForkBalances({
    impersonatedAddress,
    wagmiConfig,
    isReconnecting = false,
  }: {
    impersonatedAddress: Address
    wagmiConfig: WagmiConfig
    isReconnecting?: boolean
  }) {
    const { forkBalances, chainId } = await getOptions()
    if (forkBalances[chainId] && !isReconnecting) {
      await setTokenBalances({
        impersonatedAddress,
        wagmiConfig,
        setBalance,
        tokenBalances: forkBalances,
        chainId,
      })
    }
  }

  async function mineBlockWithTimestamp(timestamp: bigint) {
    await forkClient.setNextBlockTimestamp({
      timestamp,
    })
    await forkClient.mine({ blocks: 1 })
  }
}
