import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  UseDisclosureProps,
} from '@chakra-ui/react'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { usePathname, useRouter } from 'next/navigation'
import { Pool } from '../pool.types'
import { hasBalancerStakedBalance } from '../user-balance.helpers'

export function UnstakeWarningModal({
  isOpen = false,
  onClose = () => {},
  pool,
}: UseDisclosureProps & { pool: Pool }) {
  const router = useRouter()
  const pathname = usePathname()

  const title = 'Before you can migrate, Unstake'
  const content = `Before you can migrate to the recommended pool on Balancer v3, you need to unstake
    your existing position. Once that is completed return to this pool page to migrate.`

  const unstake = () => {
    onClose()
    router.push(`${pathname}/unstake`)
  }

  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <SuccessOverlay />

      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Text color="font.secondary">{content}</Text>
        </ModalBody>

        <ModalFooter>
          <Button onClick={unstake} variant="secondary" w="full">
            Unstake
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
