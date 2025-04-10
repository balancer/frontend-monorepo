'use client'
import { Heading, Button, Stack } from '@chakra-ui/react'
import Section from '@repo/lib/shared/components/layout/Section'

import NextLink from 'next/link'

export default function VeBALPage() {
  return (
    <>
      <Section>
        <Stack gap="lg" maxW="200px">
          <Heading as="h2" size="lg" variant="special">
            veBAL xxx
          </Heading>
          <Button as={NextLink} href="/vebal/manage" size="lg" variant="primary">
            Manage veBAL
          </Button>

          <Button as={NextLink} href="/vebal/vote" size="lg" variant="primary">
            Vote
          </Button>
        </Stack>
      </Section>
      <Section>
        <Heading as="h2" size="lg" variant="special" />
      </Section>
      <Section>
        <Heading as="h2" size="lg" variant="special">
          How it works
        </Heading>
      </Section>
    </>
  )
}
