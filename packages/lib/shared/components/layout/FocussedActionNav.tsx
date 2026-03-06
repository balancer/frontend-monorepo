'use client'

import { Card, HStack, IconButton } from '@chakra-ui/react'
import Image from 'next/image'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import Link from 'next/link'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { LuX } from 'react-icons/lu'

export interface ModalActionsNavProps {
  chain: GqlChain
  redirectPath: string
  closeButton?: boolean
}

export function FocussedActionNav({
  chain,
  redirectPath,
  closeButton = true,
}: ModalActionsNavProps) {
  const networkConfig = getNetworkConfig(chain)

  return (
    <HStack justify="space-between" mb="4">
      <Card.Root
        h={{ base: '32px', md: '40px' }}
        p={{ base: 'xs', sm: 'xs', md: 'sm' }}
        shadow="sm"
        variant="level2"
        width={{ base: '32px', md: '40px' }}
      >
        <Image alt={networkConfig.shortName} height="24" src={networkConfig.iconPath} width="24" />
      </Card.Root>
      {closeButton && (
        <IconButton aria-label="Close" asChild rounded="full" variant="outline">
          <Link href={redirectPath} prefetch>
            <LuX />
          </Link>
        </IconButton>
      )}
    </HStack>
  )
}
