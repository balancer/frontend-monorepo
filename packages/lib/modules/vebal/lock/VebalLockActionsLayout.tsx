'use client'

import { PropsWithChildren } from 'react'
import { ModalActionsLayout } from '@repo/lib/shared/components/layout/ModalActionsLayout'
import { HStack, Text } from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

type Props = PropsWithChildren

export function VebalLockActionsLayout({ children }: Props) {
  return (
    <ModalActionsLayout
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
    </ModalActionsLayout>
  )
}
