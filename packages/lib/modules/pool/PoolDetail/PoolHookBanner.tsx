import { Badge, Card, Center, Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { useHook } from '../../hooks/useHook'
import { usePool } from '../PoolProvider'
import { HookIcon } from '@repo/lib/shared/components/icons/HookIcon'

export function PoolHookBanner() {
  const { pool } = usePool()
  const { hooks, hasHookData } = useHook(pool)

  if (!hasHookData) return null

  return (
    <Card>
      <VStack alignItems="flex-start" w="full">
        {hooks.map(
          hook =>
            hook && (
              <HStack alignItems="center" direction="row" gap="4" key={hook.name} px={4} py={4}>
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
            )
        )}
      </VStack>
    </Card>
  )
}
