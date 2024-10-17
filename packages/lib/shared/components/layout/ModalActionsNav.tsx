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
        variant="level2"
        p={{ base: 'xs', sm: 'xs', md: 'sm' }}
        width={{ base: '32px', md: '40px' }}
        h={{ base: '32px', md: '40px' }}
        shadow="sm"
      >
        <Image src={networkConfig.iconPath} width="24" height="24" alt={networkConfig.shortName} />
      </Card>

      <IconButton
        as={Link}
        href={redirectPath}
        isRound={true}
        variant="outline"
        aria-label="Close"
        prefetch={true}
        icon={<CloseIcon />}
      />
    </HStack>
  )
}
