import { Box, Center, HStack, Text, useColorModeValue } from '@chakra-ui/react'

import { useHook } from '../../hooks/useHook'
import { PoolCore } from '../pool.types'
import { BalBadge } from '@repo/lib/shared/components/badges/BalBadge'
import { CustomPopover } from '@repo/lib/shared/components/popover/CustomPopover'
import { HookIcon } from '@repo/lib/shared/components/icons/HookIcon'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'

type Props = {
  pool: PoolCore
  onlyShowIcon?: boolean
}

export function PoolHookTag({ pool, onlyShowIcon = false }: Props) {
  const { hooks } = useHook(pool)

  // TODO: add nested hook support when needed
  const hook = hooks[0]

  const stopColor1 = useColorModeValue('#FFFFFF', '#FCFCFD')
  const stopColor2 = useColorModeValue('#DFCCB9', '#A0AEC0')

  if (!hook) return null

  return onlyShowIcon ? (
    <TooltipWithTouch label={hook.name + ' hook'}>
      <BalBadge
        bg={`linear-gradient(45deg, ${stopColor2} 0%, ${stopColor1} 100%)`}
        border="none"
        color="font.secondary"
        fontSize="xs"
        h="18px"
        p="0"
        shadow="md"
        textTransform="lowercase"
        w="18px"
      >
        <Center color="font.dark" h="full" w="full">
          <HookIcon size={16} />
        </Center>
      </BalBadge>
    </TooltipWithTouch>
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
          pl="xs"
          pr="sm"
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
