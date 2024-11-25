import { Badge, Center, Popover, PopoverContent, PopoverTrigger, Text } from '@chakra-ui/react'

import { HookIcon } from '@repo/lib/shared/components/icons/HookIcon'
import { useHook } from '../../hooks/useHook'
import { usePool } from '../PoolProvider'
import { getChainId } from '@repo/lib/config/app.config'

export function PoolHookTag() {
  const { pool } = usePool()
  const { hooks } = useHook(pool)

  // TODO: add nested hook support when needed
  const hook = hooks.find(
    hook => pool.hook && hook?.addresses[getChainId(pool.chain)]?.includes(pool.hook.address)
  )

  if (!hook) return null

  return (
    <Popover trigger="hover">
      <PopoverTrigger>
        <Badge
          alignItems="center"
          background="background.level2"
          border="1px solid"
          borderColor="border.base"
          color="font.primary"
          display="flex"
          fontSize="xs"
          fontWeight="normal"
          h={8}
          rounded="full"
          shadow="sm"
          w={8}
        >
          <Center h="full" w="full">
            <HookIcon size={32} />
          </Center>
        </Badge>
      </PopoverTrigger>
      <PopoverContent px="sm" py="sm" width="fit-content">
        <Text fontSize="sm" variant="secondary">
          {hook.name}
        </Text>
      </PopoverContent>
    </Popover>
  )
}
