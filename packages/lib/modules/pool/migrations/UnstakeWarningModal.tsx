import { Button, HStack, Link, Text, Dialog, Portal } from '@chakra-ui/react'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { usePathname, useRouter } from 'next/navigation'
import { Pool } from '../pool.types'
import { hasBalancerStakedBalance } from '../user-balance.helpers'
import { getAuraPoolLink } from '../pool.utils'
import { getChainId } from '@repo/lib/config/app.config'
import { ArrowUpRight } from 'react-feather'

export function UnstakeWarningModal({
  open = false,
  onClose = () => {},
  pool,
}: {
  open?: boolean
  onClose?: () => void
  pool: Pool
}) {
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
    <Dialog.Root
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) {
          onClose()
        }
      }}
      open={open}
      placement="center"
    >
      <Portal>
        <SuccessOverlay />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>{title}</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <Text color="font.secondary">{content}</Text>
            </Dialog.Body>
            <Dialog.Footer>
              {hasBalancerStakedBalance(pool) ? (
                <Button onClick={unstake} variant="secondary" w="full">
                  Unstake
                </Button>
              ) : (
                <Button asChild variant="secondary" w="full">
                  <Link href={auraRedirectLink} rel="noopener noreferrer" target="_blank">
                    <HStack>
                      <span>Go to Aura to Unstake</span>
                      <ArrowUpRight size={16} />
                    </HStack>
                  </Link>
                </Button>
              )}
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
