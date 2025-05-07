/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */

'use client'

import { useAccount, useAccountEffect, useDisconnect } from 'wagmi'
import { emptyAddress } from './contracts/wagmi-helpers'
import { PropsWithChildren, createContext, useEffect, useState } from 'react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { Address, isAddress } from 'viem'
import { setTag, setUser } from '@sentry/nextjs'
import { config, isProd, shouldUseAnvilFork } from '@repo/lib/config/app.config'
import { captureError, ensureError } from '@repo/lib/shared/utils/errors'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { useSafeAppConnectionGuard } from './useSafeAppConnectionGuard'
import { useWCConnectionLocalStorage } from './wallet-connect/useWCConnectionLocalStorage'
import { clearImpersonatedAddressLS } from '@repo/lib/test/utils/wagmi/fork.helpers'

async function isAuthorizedAddress(address: Address): Promise<boolean> {
  try {
    const res = await fetch(`/api/wallet-check/${address}`, { cache: 'no-store' })
    const data = await res.json()

    return data?.isAuthorized
  } catch (err) {
    const error = ensureError(err)
    if (isProd) captureError(error)
    return true
  }
}

export type UseUserAccountResponse = ReturnType<typeof _useUserAccount>
export const UserAccountContext = createContext<UseUserAccountResponse | null>(null)

export function _useUserAccount() {
  const isMounted = useIsMounted()
  const query = useAccount()
  const { disconnect } = useDisconnect()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isBlocked, setIsBlocked] = useState(false)

  const { address, ...queryWithoutAddress } = query

  async function blockUnauthorizedAddress(address: Address | undefined) {
    if (!address || config.appEnv === 'test') {
      setCheckingAuth(false)
      return
    }

    let isAuthorized = true
    if (isAddress(address)) {
      isAuthorized = await isAuthorizedAddress(address)
      if (!isAuthorized) disconnect()
    }

    setIsBlocked(!isAuthorized)
    setCheckingAuth(false)
  }

  useEffect(() => {
    blockUnauthorizedAddress(address)
  }, [address])

  // The usage of mounted helps to overcome nextjs hydration mismatch
  // errors where the state of the user account on the server pass is different
  // than the state on the client side rehydration.
  const result = {
    ...queryWithoutAddress,
    isLoading: !isMounted || query.isConnecting || checkingAuth,
    isConnecting: !isMounted || query.isConnecting || checkingAuth,
    // We use an emptyAddress when the user is not connected to avoid undefined value and satisfy the TS compiler
    userAddress: isMounted ? query.address || emptyAddress : emptyAddress,
    isConnected: isMounted && !!query.address && !checkingAuth,
    connector: isMounted ? query.connector : undefined,
    isBlocked,
    isWCConnector: isMounted ? query.connector?.id === 'walletConnect' : false,
  }

  useSafeAppConnectionGuard(result.connector, result.chainId)

  const { isConnectedToWC, setIsConnectedToWC } = useWCConnectionLocalStorage()

  useEffect(() => {
    if (result.userAddress) {
      onNewUserAddress(result)
    } else {
      onEmptyUserAddress()
    }
  }, [result.userAddress])

  useAccountEffect({
    onDisconnect: () => {
      if (shouldUseAnvilFork) {
        clearImpersonatedAddressLS()
      }
      if (isConnectedToWC) {
        // When disconnecting from WC connector we need a full page reload to enforce a new WC connector instance created
        console.log('Full page reload on WC disconnection')
        window.location.reload()
      }
    },
  })

  function onNewUserAddress(result: UseUserAccountResponse) {
    // Set Sentry user
    setUser({
      id: result.userAddress,
      username: result.userAddress,
    })

    if (result.isWCConnector) {
      setIsConnectedToWC(true)
    }
  }

  function onEmptyUserAddress() {
    // Clear Sentry user
    setUser(null)

    if (isConnectedToWC) {
      setIsConnectedToWC(false)
    }
  }

  useEffect(() => {
    setTag('wallet', result.connector?.id)
  }, [result.connector?.id])

  return result
}

export function UserAccountProvider({ children }: PropsWithChildren) {
  const hook = _useUserAccount()
  return <UserAccountContext.Provider value={hook}>{children}</UserAccountContext.Provider>
}

export const useUserAccount = (): UseUserAccountResponse =>
  useMandatoryContext(UserAccountContext, 'UserAccount')
