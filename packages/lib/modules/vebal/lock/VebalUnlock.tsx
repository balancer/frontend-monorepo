import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { Center } from '@chakra-ui/react'
import { VebalUnlockForm } from '@repo/lib/modules/vebal/lock/form/VebalUnlockForm'
import { useVebalLockData } from '@repo/lib/modules/vebal/lock/VebalLockDataProvider'
import { VebalLockForm } from '@repo/lib/modules/vebal/lock/form/VebalLockForm'

export function VebalUnlock() {
  const { isConnected } = useUserAccount()
  const { mainnetLockedInfo } = useVebalLockData()

  if (!isConnected) {
    return (
      <Center border="1px dashed" borderColor="border.base" h="400px" rounded="lg">
        <ConnectWallet size="lg" variant="primary" />
      </Center>
    )
  }

  if (mainnetLockedInfo.hasExistingLock && !mainnetLockedInfo.isExpired) {
    return <VebalLockForm />
  }

  return <VebalUnlockForm />
}
