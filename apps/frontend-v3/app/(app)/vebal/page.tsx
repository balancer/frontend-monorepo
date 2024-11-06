import { Button, Stack } from '@chakra-ui/react'

import NextLink from 'next/link'

export default function VebalPage() {
  return (
    <Stack gap="lg" maxW="200px">
      <Button as={NextLink} href="/vebal/manage" size="lg" variant="primary">
        Manage veBAL
      </Button>

      <Button as={NextLink} href="/vebal/vote" size="lg" variant="primary">
        Vote
      </Button>
    </Stack>
  )
}
