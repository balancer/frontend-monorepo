import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { Center } from '@chakra-ui/react'
import { VebalUnlockForm } from '@repo/lib/modules/vebal/lock/form/VebalUnlockForm'
import { useVebalLockInfo } from '@repo/lib/modules/vebal/lock/VebalLockInfoProvider'
import { VebalLockForm } from '@repo/lib/modules/vebal/lock/form/VebalLockForm'

export function VebalUnlock() {
  const { isConnected } = useUserAccount()
  const { mainnetLockedInfo } = useVebalLockInfo()

  if (!isConnected) {
    return (
      <Center h="400px" border="1px dashed" borderColor="border.base" rounded="lg">
        <ConnectWallet variant="primary" size="lg" />
      </Center>
    )
  }

  if (mainnetLockedInfo.hasExistingLock && !mainnetLockedInfo.isExpired) {
    return <VebalLockForm />
  }

  return <VebalUnlockForm />
}
