import { useUserAccount } from '../web3/UserAccountProvider'
import { Button, Heading, Stack, Text, VStack } from '@chakra-ui/react'
import { VebalStatsLayout } from './VebalStats/VebalStatsLayout'
import { VebalBreadcrumbs } from '@repo/lib/modules/vebal/VebalBreadcrumbs'

export function VebalManage() {
  const { isConnected } = useUserAccount()

  if (!isConnected) {
    return <Text>Not connected</Text>
  }

  return (
    <Stack spacing="lg">
      <VebalBreadcrumbs />
      <VStack align="start" w="full">
        <Stack
          alignItems="center"
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          spacing="md"
          w="full"
        >
          <Heading as="h2" size="lg" variant="special">
            Manage veBAL
          </Heading>

          <Stack direction={{ base: 'column', md: 'row' }} spacing="md">
            <Button
              isDisabled={false}
              onClick={() => {
                //
              }}
              size="lg"
            >
              Extend lock
            </Button>
            <Button
              isDisabled={false}
              onClick={() => {
                //
              }}
              size="lg"
              variant="primary"
            >
              Get veBAL
            </Button>
          </Stack>
        </Stack>
      </VStack>
      <VebalStatsLayout />
    </Stack>
  )
}
