import { Box, Center, HStack, Text } from '@chakra-ui/react'
import { HookIcon } from '@repo/lib/shared/components/icons/HookIcon'
import { useHook } from '../../hooks/useHook'
import { PoolCore } from '../pool.types'
import { BalBadge } from '@repo/lib/shared/components/badges/BalBadge'
import { CustomPopover } from '@repo/lib/shared/components/popover/CustomPopover'

type Props = {
  pool: PoolCore
  onlyShowIcon?: boolean
}

export function PoolHookTag({ pool, onlyShowIcon = false }: Props) {
  const { hooks } = useHook(pool)

  // TODO: add nested hook support when needed
  const hook = hooks[0]

  if (!hook) return null

  return onlyShowIcon ? (
    <BalBadge
      bg="background.level3"
      color="font.secondary"
      fontSize="xs"
      h="22px"
      p="0"
      textTransform="lowercase"
      w="22px"
    >
      <Center color="font.secondary" h="full" w="full">
        <HookIcon size={16} />
      </Center>
    </BalBadge>
  ) : (
    <CustomPopover
      bodyText={hook.description}
      footerUrl={hook.learnMore}
      headerText={`${hook.name} Hook`}
      trigger="hover"
      useIsOpen
    >
      {({ isOpen }) => (
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
            <HookIcon size={18} />
            <Text
              color={isOpen ? 'font.primary' : 'font.secondary'}
              fontSize="sm"
              variant="secondary"
            >
              {hook.name}
            </Text>
          </HStack>
        </Box>
      )}
    </CustomPopover>
  )
}
