import { Alert, AlertIcon, Button, HStack, Link } from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'

export function MerklAlert() {
  return (
    <Alert status="info" width="full">
      <MerklTitle />
    </Alert>
  )
}

function MerklTitle() {
  return (
    <HStack justify="space-between" w="full">
      <HStack>
        <AlertIcon />
        <div>It looks like you could also have Merkl rewards.</div>
      </HStack>
      <Button
        as={Link}
        target="_blank"
        href="https://app.merkl.xyz/"
        width="auto"
        variant="outline"
        rightIcon={<ArrowUpRight />}
      >
        Learn more
      </Button>
    </HStack>
  )
}
