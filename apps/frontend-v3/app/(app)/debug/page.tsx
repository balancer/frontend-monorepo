'use client'
import { Heading, VStack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { Link } from '@chakra-ui/react'
import FadeInOnView from '@/lib/shared/components/containers/FadeInOnView'

export default function Debug() {
  return (
    <FadeInOnView>
      <VStack padding="lg" margin="lg">
        <Heading size="md">Demos</Heading>
        <Link as={NextLink} href="/debug/pools">
          Pools
        </Link>
        <Link as={NextLink} href="/debug/token-select">
          Token select
        </Link>
        <Link as={NextLink} href="/debug/token-input">
          Token input
        </Link>
        <Link as={NextLink} href="/debug/sentry">
          Sentry
        </Link>
        <Link as={NextLink} href="/debug/wallet-check">
          Wallet check
        </Link>
        <Link as={NextLink} href="/debug/alerts">
          Alerts
        </Link>
        <Link as={NextLink} href="/debug/modal">
          Modal animation
        </Link>
        <Link as={NextLink} href="/debug/remove-allowance">
          Remove token allowance
        </Link>
        <Link as={NextLink} href="/debug/revoke-relayer-approval">
          Revoke relayer approval
        </Link>
        <Link as={NextLink} href="/debug/permit2-allowance">
          Permit2 allowance
        </Link>
        <Link as={NextLink} href="/debug/permit2-allowance">
          Permit2 allowance
        </Link>
      </VStack>
    </FadeInOnView>
  )
}
