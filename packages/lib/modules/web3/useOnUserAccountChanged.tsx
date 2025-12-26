import { useEffect, useRef } from 'react'
import { useUserAccount } from './UserAccountProvider'
import { Address } from 'viem'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { emptyAddress } from './contracts/wagmi-helpers'

export function useOnUserAccountChanged(callback: () => void) {
  const prevUserAddressRef = useRef<Address | undefined>(undefined)
  const callbackRef = useRef(callback)
  const { userAddress } = useUserAccount()
  const isMounted = useIsMounted()

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!isMounted) {
      prevUserAddressRef.current = userAddress
      return
    }

    if (
      prevUserAddressRef.current !== undefined &&
      prevUserAddressRef.current !== emptyAddress &&
      prevUserAddressRef.current !== userAddress
    ) {
      callbackRef.current()
    }

    prevUserAddressRef.current = userAddress
  }, [userAddress, isMounted])
}
