import { Badge, Card, Center, Heading, HStack, Stack, Text } from '@chakra-ui/react'
import { useHook } from '../../hooks/useHook'

import { usePool } from '../PoolProvider'
import { HookIcon } from '@repo/lib/shared/components/icons/HookIcon'

export function PoolHookBanner() {
  const { pool } = usePool()
  const { hook } = useHook(pool)

  if (!hook) return null

  return (
    <Card variant="level0">
      <HStack alignItems="center" direction="row" gap="4" px={4} py={4}>
        <Badge
          alignItems="center"
          background="background.level0"
          border="1px solid"
          borderColor="border.base"
          color="font.primary"
          display="flex"
          fontSize="xs"
          fontWeight="normal"
          h={14}
          rounded="full"
          shadow="sm"
          w={14}
        >
          <Center h="full" w="full">
            <HookIcon size={45} />
          </Center>
        </Badge>

        <Stack>
          <Heading fontSize="1.25rem" variant="h4">
            {hook.name}
          </Heading>
          <Text fontSize="sm" fontWeight="medium" variant="secondary">
            {hook.description}
          </Text>
        </Stack>
      </HStack>
    </Card>
  )
}
