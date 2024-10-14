import { useDisclosure } from '@chakra-ui/react'
import { Pool } from './PoolProvider'
import { usePoolRedirect } from './pool.hooks'

export function useModalWithPoolRedirect(pool: Pool, txHash: string | undefined) {
  const { onClose: onModalClose, onOpen, isOpen } = useDisclosure()
  const { redirectToPoolPage } = usePoolRedirect(pool)

  const onClose = () => {
    if (txHash) {
      redirectToPoolPage()
    } else {
      onModalClose()
    }
  }

  return { onOpen, isOpen, onClose }
}
