'use client'

import { Card, HStack, IconButton } from '@chakra-ui/react'
import Image from 'next/image'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { CloseIcon } from '@chakra-ui/icons'
import Link from 'next/link'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export interface ModalActionsNavProps {
  chain: GqlChain
  redirectPath: string
}

export function ModalActionsNav({ chain, redirectPath }: ModalActionsNavProps) {
  const networkConfig = getNetworkConfig(chain)

  return (
    <HStack justify="space-between" mb="4">
      <Card
        h={{ base: '32px', md: '40px' }}
        p={{ base: 'xs', sm: 'xs', md: 'sm' }}
        shadow="sm"
        variant="level2"
        width={{ base: '32px', md: '40px' }}
      >
        <Image alt={networkConfig.shortName} height="24" src={networkConfig.iconPath} width="24" />
      </Card>

      <IconButton
        aria-label="Close"
        as={Link}
        href={redirectPath}
        icon={<CloseIcon />}
        isRound
        prefetch
        variant="outline"
      />
    </HStack>
  )
}
