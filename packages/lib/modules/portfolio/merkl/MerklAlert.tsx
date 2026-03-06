import { Box, Text, Flex, Alert, Button, HStack, Link } from '@chakra-ui/react'
import { LightbulbIcon } from '@repo/lib/shared/components/icons/LightbulbIcon'
import { ArrowUpRight } from 'react-feather'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function MerklAlert() {
  return (
    <Alert.Root shadow="2xl" status="info" width="full">
      <MerklTitle />
    </Alert.Root>
  )
}

function MerklTitle() {
  return (
    <Flex
      color="font.dark"
      direction={{ base: 'column', md: 'row' }}
      gap={{ base: 'ms', md: '0' }}
      justify="space-between"
      w="full"
    >
      <HStack alignItems={{ base: 'start', md: 'center' }}>
        <Box minW="24px">
          <LightbulbIcon height="24" width="24" />
        </Box>
        <Text color="font.dark" fontWeight="medium">
          {`You may have additional claimable Merkl rewards from your ${PROJECT_CONFIG.projectName} activity`}
        </Text>
      </HStack>
      <Button
        _hover={{
          bg: 'font.dark',
          color: 'white',
          textDecoration: 'none',
        }}
        asChild
        borderColor="font.dark"
        color="font.dark"
        cursor="pointer"
        ml={{ base: '32px', md: 'ms' }}
        role="group"
        size="xs"
        variant="outline"
        width="120px"
      >
        <Link href="https://app.merkl.xyz/" rel="noopener noreferrer" target="_blank">
          <Text
            _groupHover={{ color: 'white' }}
            color="font.dark"
            fontSize="14px"
            fontWeight="bold"
          >
            Learn more
          </Text>
          <ArrowUpRight size="14" />
        </Link>
      </Button>
    </Flex>
  )
}
