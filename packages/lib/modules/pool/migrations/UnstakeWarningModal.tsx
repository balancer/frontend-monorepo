import {
  Button,
  HStack,
  Link,
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
import { getAuraPoolLink } from '../pool.utils'
import { getChainId } from '@repo/lib/config/app.config'
import { ArrowUpRight } from 'react-feather'

export function UnstakeWarningModal({
  isOpen = false,
  onClose = () => {},
  pool,
}: UseDisclosureProps & { pool: Pool }) {
  const router = useRouter()
  const pathname = usePathname()

  const title = hasBalancerStakedBalance(pool)
    ? 'Before you can migrate, Unstake'
    : 'Before you can migrate, Unstake on Aura'
  const content = hasBalancerStakedBalance(pool)
    ? `Before you can migrate to the recommended pool on Balancer v3, you need to unstake
  your existing position. Once that is completed return to this pool page to migrate.`
    : `Before you can migrate to the recommended pool on Balancer v3, you need to unstake
    your existing position. Since you are currently staking on Aura, you need to go to their
    UI first and unstake. Once that is completed return to this pool page to migrate.`

  const auraRedirectLink = getAuraPoolLink(
    getChainId(pool.chain),
    pool.staking?.aura?.auraPoolId || ''
  )

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
          {hasBalancerStakedBalance(pool) ? (
            <Button onClick={unstake} variant="secondary" w="full">
              Unstake
            </Button>
          ) : (
            <Button as={Link} href={auraRedirectLink} isExternal variant="secondary" w="full">
              <HStack>
                <span>Go to Aura to Unstake</span>
                <ArrowUpRight size={16} />
              </HStack>
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
