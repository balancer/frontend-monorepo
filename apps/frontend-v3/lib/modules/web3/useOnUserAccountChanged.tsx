import { useEffect, useState } from 'react'
import { useUserAccount } from './UserAccountProvider'
import { Address } from 'viem'
import { useIsMounted } from '@/lib/shared/hooks/useIsMounted'
import { emptyAddress } from './contracts/wagmi-helpers'

export function useOnUserAccountChanged(callback: () => void) {
  const [prevUserAddress, setPrevUserAddress] = useState<Address>()
  const { userAddress } = useUserAccount()
  const isMounted = useIsMounted()

  useEffect(() => {
    if (isMounted && prevUserAddress !== emptyAddress) {
      callback()
    }
    setPrevUserAddress(userAddress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress])
}
