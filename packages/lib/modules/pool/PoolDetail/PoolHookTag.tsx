import {
  Box,
  HStack,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
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
  showName?: boolean
}

export function PoolHookTag({ pool, showName = false }: Props) {
  const { hooks } = useHook(pool)

  // TODO: add nested hook support when needed
  const hook = hooks[0]

  if (!hook) return null

  return (
    <Popover trigger="hover">
      {({ isOpen }) => (
        <>
          <PopoverTrigger>
            <Box
              alignItems="center"
              background="background.level2"
              border="1px solid"
              borderColor={isOpen ? 'font.primary' : 'border.base'}
              display="flex"
              fontWeight="normal"
              h={{ base: '28px' }}
              px="sm"
              py="xs"
              rounded="full"
              shadow="sm"
            >
              <HStack color={isOpen ? 'font.primary' : 'font.secondary'} gap="xs">
                <HookIcon size={20} />
                {showName && (
                  <Text
                    color={isOpen ? 'font.primary' : 'font.secondary'}
                    fontSize="sm"
                    variant="secondary"
                  >
                    {hook.name}
                  </Text>
                )}
              </HStack>
            </Box>
          </PopoverTrigger>
          <Portal>
            <PopoverContent px="sm" py="sm">
              <PopoverArrow bg="background.level3" />
              <PopoverHeader>
                <Text color="font.secondary" fontWeight="bold" size="md">
                  {hook.name} Hook
                </Text>
              </PopoverHeader>
              <PopoverBody>
                <Text fontSize="sm" variant="secondary">
                  {hook.description}
                </Text>
              </PopoverBody>
              {hook.learnMore && (
                <PopoverFooter>
                  <Link href={hook.learnMore} target="_blank">
                    Learn more
                  </Link>
                </PopoverFooter>
              )}
            </PopoverContent>
          </Portal>
        </>
      )}
    </Popover>
  )
}
