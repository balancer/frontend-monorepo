import { Box, Center, Heading, Stack } from '@chakra-ui/react'
import { VebalBreadcrumbs } from '@repo/lib/modules/vebal/VebalBreadcrumbs'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { useUserAccount } from '../web3/UserAccountProvider'
import { VeBalLockButtons } from './VeBalLockButtons'
import { VeBalPotentialBar } from './VeBalPotentialBar'
import { VeBalSectionHeader } from './VeBalSectionHeader'
import { VebalStatsLayout } from './VebalStats/VebalStatsLayout'

export function VebalManage() {
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
          after={<VeBalLockButtons />}
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
