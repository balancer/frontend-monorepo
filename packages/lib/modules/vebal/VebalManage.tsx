import { useUserAccount } from '../web3/UserAccountProvider'
import { Box, Button, Center, Heading, Stack, VStack } from '@chakra-ui/react'
import { VebalStatsLayout } from './VebalStats/VebalStatsLayout'
import { VebalBreadcrumbs } from '@repo/lib/modules/vebal/VebalBreadcrumbs'
import { ReactNode } from 'react'
import NextLink from 'next/link'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { useVebalLockData } from '@repo/lib/modules/vebal/lock/VebalLockDataProvider'
import { getVeBalManagePath } from './vebal-navigation'

interface HeaderProps {
  before?: ReactNode
  after?: ReactNode
}

function SectionHeader({ before, after }: HeaderProps) {
  return (
    <VStack align="start" w="full">
      <Stack
        alignItems="center"
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        spacing="md"
        w="full"
      >
        {before ? (
          <Stack direction={{ base: 'column', sm: 'row' }} spacing="md">
            {before}
          </Stack>
        ) : null}

        {after ? (
          <Stack direction={{ base: 'column', sm: 'row' }} spacing="md">
            {after}
          </Stack>
        ) : null}
      </Stack>
    </VStack>
  )
}

export function VebalManage() {
  const lockData = useVebalLockData()
  const { isConnected } = useUserAccount()

  if (!isConnected) {
    return (
      <Stack spacing="2xl">
        <Stack spacing="lg">
          <VebalBreadcrumbs />
          <SectionHeader
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
        <SectionHeader
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
    </Stack>
  )
}
