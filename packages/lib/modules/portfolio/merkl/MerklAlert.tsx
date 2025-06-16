import { Box, Text, Flex, Alert, Button, HStack, Link } from '@chakra-ui/react'
import { LightbulbIcon } from '@repo/lib/shared/components/icons/LightbulbIcon'
import { ArrowUpRight } from 'react-feather'

export function MerklAlert() {
  return (
    <Alert shadow="2xl" status="info" width="full">
      <MerklTitle />
    </Alert>
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
        borderColor="font.dark"
        color="font.dark"
        cursor="pointer"
        href="https://app.merkl.xyz/"
        ml={{ base: '32px', md: 'ms' }}
        rightIcon={<ArrowUpRight size="14" />}
        role="group"
        size="xs"
        target="_blank"
        variant="outline"
        width="120px"
      >
        <Text _groupHover={{ color: 'white' }} color="font.dark" fontSize="14px" fontWeight="bold">
          Learn more
        </Text>
      </Button>
    </Flex>
  )
}
