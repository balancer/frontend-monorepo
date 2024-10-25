'use client'

import { PropsWithChildren } from 'react'
import { FocussedActionLayout } from '@repo/lib/shared/components/layout/FocussedActionLayout'
import { HStack, Text } from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

type Props = PropsWithChildren

export function VebalLockActionsLayout({ children }: Props) {
  return (
    <FocussedActionLayout
      chain={GqlChain.Mainnet}
      leftSlot={
        <HStack px="sm">
          <Text color="font.light" lineHeight="1">
            Manage veBAL
          </Text>
        </HStack>
      }
      redirectPath="/vebal/manage"
    >
      {children}
    </FocussedActionLayout>
  )
}
