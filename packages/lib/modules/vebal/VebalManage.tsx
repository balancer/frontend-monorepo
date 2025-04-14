import { Box, Button, Center, Heading, Stack } from '@chakra-ui/react'
import { useVebalLockData } from '@repo/lib/modules/vebal/lock/VebalLockDataProvider'
import { VebalBreadcrumbs } from '@repo/lib/modules/vebal/VebalBreadcrumbs'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import NextLink from 'next/link'
import { useUserAccount } from '../web3/UserAccountProvider'
import { getVeBalManagePath } from './vebal-navigation'
import { VeBalPotentialBar } from './VeBalPotentialBar'
import { VeBalSectionHeader } from './VeBalSectionHeader'
import { VebalStatsLayout } from './VebalStats/VebalStatsLayout'

export function VebalManage() {
  const lockData = useVebalLockData()
  const { isConnected } = useUserAccount()

  if (!isConnected) {
    return (
      <Stack spacing="2xl">
        <Stack spacing="lg">
          <VebalBreadcrumbs />
          <VeBalSectionHeader
            before={
              <Heading as="h2" size="lg" variant="special">
                Manage veBAL
              </Heading>
            }
          />
          <Center border="1px dashed" borderColor="border.base" h="400px" rounded="lg">
            <Box>
              <ConnectWallet size="lg" variant="primary" />
            </Box>
          </Center>
        </Stack>
      </Stack>
    )
  }

  return (
    <Stack spacing="2xl">
      <Stack spacing="lg">
        <VebalBreadcrumbs />
        <VeBalSectionHeader
          after={
            <>
              {!!lockData.mainnetLockedInfo.hasExistingLock && (
                <Button
                  as={NextLink}
                  href={getVeBalManagePath('extend', 'manage')}
                  isLoading={lockData.isLoading}
                  size="lg"
                >
                  Extend lock
                </Button>
              )}
              <Button
                as={NextLink}
                href={
                  lockData.mainnetLockedInfo.isExpired
                    ? getVeBalManagePath('unlock', 'manage')
                    : getVeBalManagePath('lock', 'manage')
                }
                isLoading={lockData.isLoading}
                size="lg"
                variant="primary"
              >
                {lockData.mainnetLockedInfo.isExpired ? 'Unlock' : 'Get veBAL'}
              </Button>
            </>
          }
          before={
            <Heading as="h2" size="lg" variant="special">
              Manage veBAL
            </Heading>
          }
        />
        <VebalStatsLayout />
      </Stack>
      <VeBalPotentialBar />
    </Stack>
  )
}
