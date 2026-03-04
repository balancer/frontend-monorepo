import { useDisclosure } from '@chakra-ui/react';
import { Pool } from './pool.types'
import { usePoolRedirect } from './pool.hooks'

export function useModalWithPoolRedirect(
  pool: Pool,
  txHash: string | undefined,
  enableRedirect = true
) {
  const { onClose: onModalClose, onOpen, open } = useDisclosure()
  const { redirectToPoolPage } = usePoolRedirect(pool)

  const onClose = () => {
    if (txHash && enableRedirect) {
      redirectToPoolPage()
    } else {
      onModalClose()
    }
  }

  return { onOpen, open, onClose }
}
