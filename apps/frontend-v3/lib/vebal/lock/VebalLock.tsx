import { VebalLockForm } from '@bal/lib/vebal/lock/form/VebalLockForm'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { Box, Center } from '@chakra-ui/react'

export function VebalLock() {
  const { isConnected } = useUserAccount()

  if (!isConnected) {
    return (
      <Center border="1px dashed" borderColor="border.base" h="400px" rounded="lg">
        <Box>
          <ConnectWallet size="lg" variant="primary" />
        </Box>
      </Center>
    )
  }

  return <VebalLockForm editAlwaysOn />
}
