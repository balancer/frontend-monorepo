import { Center, Popover, PopoverContent, PopoverTrigger } from '@chakra-ui/react'
import { BalBadge } from '@repo/lib/shared/components/badges/BalBadge'
import { HookIcon } from '@repo/lib/shared/components/icons/HookIcon'
import { useHook } from '../../hooks/useHook'
import { usePool } from '../PoolProvider'

export function PoolHookTag() {
  const { pool } = usePool()
  const { hook } = useHook(pool)

  if (!hook) return null

  return (
    <Popover>
      <PopoverTrigger>
        <BalBadge color="font.primary" fontSize="xs" h={8} w={8}>
          <Center h="full" w="full">
            <HookIcon size={20} />
          </Center>
        </BalBadge>
      </PopoverTrigger>
      <PopoverContent>{hook.name}</PopoverContent>
    </Popover>
  )
}
