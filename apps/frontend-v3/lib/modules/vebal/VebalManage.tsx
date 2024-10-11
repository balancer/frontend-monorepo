import { useUserAccount } from '../web3/UserAccountProvider'
import { Button, Heading, Stack, Text, VStack } from '@chakra-ui/react'
import { VebalStatsLayout } from './VebalStats/VebalStatsLayout'
import { VebalBreadcrumbs } from '@/lib/modules/vebal/VebalBreadcrumbs'

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
          w="full"
          justify="space-between"
          alignItems="center"
          spacing="md"
          direction={{ base: 'column', md: 'row' }}
        >
          <Heading as="h2" size="lg" variant="special">
            Manage veBAL
          </Heading>

          <Stack spacing="md" direction={{ base: 'column', md: 'row' }}>
            <Button
              onClick={() => {
                //
              }}
              size="lg"
              isDisabled={false}
            >
              Extend lock
            </Button>
            <Button
              onClick={() => {
                //
              }}
              variant="primary"
              size="lg"
              isDisabled={false}
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
