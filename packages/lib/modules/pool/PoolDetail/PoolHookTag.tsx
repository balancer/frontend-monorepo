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

import {
  GqlHook,
  GqlPoolTokenDetail,
  GqlChain,
} from '@repo/lib/shared/services/api/generated/graphql'

type Props = {
  poolHook: GqlHook | null | undefined
  poolTokens: GqlPoolTokenDetail[]
  chain: GqlChain
}

export function PoolHookTag({ poolHook, poolTokens, chain }: Props) {
  const { hooks } = useHook({
    hook: poolHook,
    poolTokens,
    chain,
  })

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
