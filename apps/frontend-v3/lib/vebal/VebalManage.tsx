import { Flex, Box, Center, Heading, Stack } from '@chakra-ui/react'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { VeBalLockButtons } from './VeBalLockButtons'
import { VeBalPotentialBar } from './VeBalPotentialBar'
import { VeBalSectionHeader } from './VeBalSectionHeader'
import { VebalStatsLayout } from './VebalStats/VebalStatsLayout'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { VebalBreadcrumbs } from './VebalBreadcrumbs'

import { VeBalCrossChainSync } from './VeBalCrossChainSync'

export function VebalManage() {
  const { isConnected } = useUserAccount()

  if (!isConnected) {
    return (
      <Stack spacing="2xl">
        <Stack spacing="lg">
          <VebalBreadcrumbs />
          <VeBalSectionHeader
            before={
              <Heading as="h2" pb="0.5" size="lg" variant="special">
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
        <VeBalCrossChainSync />
      </Stack>
    )
  }

  return (
    <Stack spacing="2xl">
      <Stack spacing="lg">
        <VebalBreadcrumbs />
        <Flex alignItems="end" justifyContent="space-between" w="full">
          <Heading as="h2" pb="0.5" size="lg" variant="special">
            Manage veBAL
          </Heading>
          <VeBalLockButtons />
        </Flex>
        <VebalStatsLayout />
      </Stack>
      <VeBalPotentialBar />
      <VeBalCrossChainSync />
    </Stack>
  )
}
