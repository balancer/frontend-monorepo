import { Flex, Button, ButtonProps } from '@chakra-ui/react'
import { getVeBalManagePath, VeBalAction, VeBalSourcePage } from './vebal-navigation'
import NextLink from 'next/link'
import { useVebalLockData } from '@repo/lib/modules/vebal/VebalLockDataProvider'
import { useMaxAmountOfVeBAL } from './useMaxAmountOfVeBal'

type Props = {
  variant?: 'primary' | 'tertiary'
  size?: ButtonProps['size']
  action?: VeBalAction
  sourcePage?: VeBalSourcePage
}

export function VeBalLockButtons(props: Props) {
  const lockData = useVebalLockData()

  return (
    <Flex gap="ms">
      <VeBalExtendLockButton
        {...props}
        action="extend"
        size="md"
        sourcePage="manage"
        variant="tertiary"
      />
      <VeBalGetOrUnLockButton
        {...props}
        action={lockData.mainnetLockedInfo.isExpired ? 'unlock' : 'lock'}
        size="md"
        sourcePage="manage"
      />
    </Flex>
  )
}

export function VeBalExtendLockButton({
  size = 'lg',
  variant = 'primary',
  action = 'extend',
  sourcePage = 'manage',
}: Props) {
  const lockData = useVebalLockData()
  const { canExtendLock } = useMaxAmountOfVeBAL()

  if (!lockData.mainnetLockedInfo.hasExistingLock) return null

  return (
    <Button
      as={NextLink}
      disabled={!canExtendLock}
      href={getVeBalManagePath(action, sourcePage)}
      isLoading={lockData.isLoading}
      minWidth={{ base: '94px', md: '110px' }}
      size={size}
      variant={variant}
    >
      Extend lock
    </Button>
  )
}

function VeBalGetOrUnLockButton({ size = 'lg', action = 'lock', sourcePage = 'manage' }: Props) {
  const lockData = useVebalLockData()
  return (
    <Button
      as={NextLink}
      href={getVeBalManagePath(action, sourcePage)}
      isLoading={lockData.isLoading}
      minWidth={{ base: '94px', md: '110px' }}
      size={size}
      variant="primary"
    >
      {lockData.mainnetLockedInfo.isExpired ? 'Unlock' : 'Get veBAL'}
    </Button>
  )
}
