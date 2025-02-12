import {
  Badge,
  Center,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
} from '@chakra-ui/react'
import { HookIcon } from '@repo/lib/shared/components/icons/HookIcon'
import { useHook } from '../../hooks/useHook'

import { PoolListItem } from '../pool.types'
import { Pool } from '../pool.types'

type Props = {
  pool: Pool | PoolListItem
  size?: 'sm' | 'md'
}

const badgeSize = {
  sm: { h: 7, w: 7, iconSize: 25 },
  md: { h: 8, w: 8, iconSize: 32 },
}

export function PoolHookTag({ pool, size = 'md' }: Props) {
  const { hooks } = useHook(pool)

  // TODO: add nested hook support when needed
  const hook = hooks[0]

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
          h={badgeSize[size].h}
          rounded="full"
          shadow="sm"
          w={badgeSize[size].w}
        >
          <Center h="full" w="full">
            <HookIcon size={badgeSize[size].iconSize} />
          </Center>
        </Badge>
      </PopoverTrigger>
      <Portal>
        <PopoverContent px="sm" py="sm" width="fit-content">
          <Text fontSize="sm" variant="secondary">
            {hook.name}
          </Text>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
