import { VebalLockForm } from '@repo/lib/modules/vebal/lock/form/VebalLockForm'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { Center } from '@chakra-ui/react'

export function VebalLock() {
  const { isConnected } = useUserAccount()

  if (!isConnected) {
    return (
      <Center h="400px" border="1px dashed" borderColor="border.base" rounded="lg">
        <ConnectWallet variant="primary" size="lg" />
      </Center>
    )
  }

  return <VebalLockForm />
}
