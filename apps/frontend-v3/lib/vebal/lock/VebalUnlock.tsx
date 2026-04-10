import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { Center } from '@chakra-ui/react'
import { VebalUnlockForm } from '@bal/lib/vebal/lock/form/VebalUnlockForm'

export function VebalUnlock() {
  const { isConnected } = useUserAccount()

  if (!isConnected) {
    return (
      <Center border="1px dashed" borderColor="border.base" h="400px" rounded="lg">
        <ConnectWallet size="lg" variant="primary" />
      </Center>
    )
  }

  return <VebalUnlockForm />
}
