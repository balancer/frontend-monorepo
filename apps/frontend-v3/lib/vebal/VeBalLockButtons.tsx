import { Flex, Button, ButtonProps } from '@chakra-ui/react'
import { getVeBalManagePath, VeBalAction, VeBalSourcePage } from './vebal-navigation'
import NextLink from 'next/link'
import { useVebalLockData } from '@repo/lib/modules/vebal/VebalLockDataProvider'

type Props = {
  variant?: 'primary' | 'tertiary'
  size?: ButtonProps['size']
  action?: VeBalAction
  sourcePage?: VeBalSourcePage
}

export function VeBalLockButtons(props: Props) {
  return (
    <Flex gap="ms">
      <VeBalGetOrUnLockButton {...props} action="unlock" size="md" sourcePage="manage" />
    </Flex>
  )
}

function VeBalGetOrUnLockButton({ size = 'lg', action = 'lock', sourcePage = 'manage' }: Props) {
  const lockData = useVebalLockData()
  return (
    <Button
      as={NextLink}
      hidden={!lockData.mainnetLockedInfo.isExpired}
      href={getVeBalManagePath(action, sourcePage)}
      isLoading={lockData.isLoading}
      minWidth={{ base: '94px', md: '110px' }}
      size={size}
      variant="primary"
    >
      Unlock
    </Button>
  )
}
