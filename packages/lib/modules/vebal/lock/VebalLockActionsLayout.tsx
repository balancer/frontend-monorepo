'use client'

import { HStack, Text } from '@chakra-ui/react'
import { FocussedActionLayout } from '@repo/lib/shared/components/layout/FocussedActionLayout'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PropsWithChildren } from 'react'
import { PriceImpactProvider } from '../../price-impact/PriceImpactProvider'
import { TokenInputsValidationProvider } from '../../tokens/TokenInputsValidationProvider'
import { VebalLockProvider } from './VebalLockProvider'
import { useVeBalRedirectPath } from '../vebal-navigation'

type Props = PropsWithChildren

export function VebalLockActionsLayout({ children }: Props) {
  const { redirectPath } = useVeBalRedirectPath()

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
      redirectPath={redirectPath}
    >
      <TokenInputsValidationProvider>
        <PriceImpactProvider>
          <VebalLockProvider>{children}</VebalLockProvider>
        </PriceImpactProvider>
      </TokenInputsValidationProvider>
    </FocussedActionLayout>
  )
}
