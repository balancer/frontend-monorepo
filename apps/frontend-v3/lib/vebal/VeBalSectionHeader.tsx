import { Stack, VStack } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface Props {
  before?: ReactNode
  after?: ReactNode
}

export function VeBalSectionHeader({ before, after }: Props) {
  return (
    <VStack align="start" w="full">
      <Stack
        alignItems="center"
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        spacing="md"
        w="full"
      >
        {before ? (
          <Stack direction={{ base: 'column', sm: 'row' }} spacing="md">
            {before}
          </Stack>
        ) : null}

        {after ? (
          <Stack direction={{ base: 'column', sm: 'row' }} spacing="md">
            {after}
          </Stack>
        ) : null}
      </Stack>
    </VStack>
  )
}
