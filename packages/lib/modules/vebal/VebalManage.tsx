import { useUserAccount } from '../web3/UserAccountProvider'
import { Button, Center, Heading, Stack, VStack } from '@chakra-ui/react'
import { VebalStatsLayout } from './VebalStats/VebalStatsLayout'
import { VebalBreadcrumbs } from '@repo/lib/modules/vebal/VebalBreadcrumbs'
import { ReactNode } from 'react'
import NextLink from 'next/link'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { useVebalLockInfo } from '@repo/lib/modules/vebal/lock/VebalLockInfoProvider'

interface HeaderProps {
  before?: ReactNode
  after?: ReactNode
}

function SectionHeader({ before, after }: HeaderProps) {
  return (
    <VStack align="start" w="full">
      <Stack
        w="full"
        justify="space-between"
        alignItems="center"
        spacing="md"
        direction={{ base: 'column', md: 'row' }}
      >
        {before && (
          <Stack spacing="md" direction={{ base: 'column', sm: 'row' }}>
            {before}
          </Stack>
        )}

        {after && (
          <Stack spacing="md" direction={{ base: 'column', sm: 'row' }}>
            {after}
          </Stack>
        )}
      </Stack>
    </VStack>
  )
}

export function VebalManage() {
  const lockInfo = useVebalLockInfo()
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
          <Center h="400px" border="1px dashed" borderColor="border.base" rounded="lg">
            <ConnectWallet variant="primary" size="lg" />
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
          before={
            <Heading as="h2" size="lg" variant="special">
              Manage veBAL
            </Heading>
          }
          after={
            <>
              {lockInfo.mainnetLockedInfo.hasExistingLock && (
                <Button
                  isLoading={lockInfo.isLoading}
                  as={NextLink}
                  href="/vebal/manage/lock"
                  size="lg"
                >
                  Extend lock
                </Button>
              )}
              <Button
                isLoading={lockInfo.isLoading}
                as={NextLink}
                href={
                  lockInfo.mainnetLockedInfo.isExpired
                    ? '/vebal/manage/unlock'
                    : '/vebal/manage/lock'
                }
                size="lg"
                variant="primary"
              >
                {lockInfo.mainnetLockedInfo.isExpired ? 'Unlock' : 'Get veBAL'}
              </Button>
            </>
          }
        />
        <VebalStatsLayout />
      </Stack>
    </Stack>
  )
}
