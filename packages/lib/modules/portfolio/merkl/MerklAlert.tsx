import { Box, Text, Flex, Alert, Button, HStack, Link } from '@chakra-ui/react'
import { LightbulbIcon } from '@repo/lib/shared/components/icons/LightbulbIcon'
import { ArrowUpRight } from 'react-feather'

export function MerklAlert() {
  return (
    <Alert status="info" width="full" shadow="2xl">
      <MerklTitle />
    </Alert>
  )
}

function MerklTitle() {
  return (
    <Flex
      justify="space-between"
      w="full"
      color="font.dark"
      direction={{ base: 'column', md: 'row' }}
      gap={{ base: 'ms', md: '0' }}
    >
      <HStack alignItems={{ base: 'start', md: 'center' }}>
        <Box minW="24px">
          <LightbulbIcon width="24" height="24" />
        </Box>
        <Text color="font.dark" fontWeight="medium">
          You may have additional claimable Merkl rewards from your Balancer activity
        </Text>
      </HStack>
      <Button
        _hover={{
          bg: 'font.dark',
          color: 'white',
          textDecoration: 'none',
        }}
        as={Link}
        href="https://app.merkl.xyz/"
        rightIcon={<ArrowUpRight size="14" />}
        target="_blank"
        variant="outline"
        width="120px"
        color="font.dark"
        borderColor="font.dark"
        size="xs"
        ml={{ base: '32px', md: 'ms' }}
        role="group"
        cursor="pointer"
      >
        <Text fontSize="14px" color="font.dark" fontWeight="bold" _groupHover={{ color: 'white' }}>
          Learn more
        </Text>
      </Button>
    </Flex>
  )
}
