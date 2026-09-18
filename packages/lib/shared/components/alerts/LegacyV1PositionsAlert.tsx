'use client'

import { Alert, Box, Link, Text } from '@chakra-ui/react'
import { ArrowUpRight } from 'lucide-react'
import { isBalancer } from '@repo/lib/config/getProjectConfig'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useLegacyV1Positions } from '@repo/lib/modules/pool/legacy/useLegacyV1Positions'

/*
  Balancer V1 only ever existed on mainnet, so both the positions and the legacy exit UI are
  Balancer-only — this must not surface in the Beets app, which shares this package.
*/
const EXIT_UI_URL = 'https://legacy.balancer.fi'

/*
  Shown while a connected wallet still holds Balancer V1 pool tokens. V1 predates the vault and is
  not covered by the Balancer API, so those positions are invisible in the portfolio.
*/
export function LegacyV1PositionsAlert() {
  const { isConnected } = useUserAccount()
  const { hasLegacyV1Positions } = useLegacyV1Positions()

  if (!isBalancer || !isConnected || !hasLegacyV1Positions) return null

  const fontProps = {
    color: 'font.dark',
    fontSize: 'lg',
    fontWeight: 'bold',
  }

  return (
    <Alert justifyContent="center" rounded="none" status="warning" textAlign="center">
      <Text {...fontProps}>
        Legacy Balancer V1 positions detected — go to{' '}
        <Link
          _hover={{ ...fontProps, textDecoration: 'none' }}
          alignItems="center"
          display="inline-flex"
          href={EXIT_UI_URL}
          isExternal
          textDecoration="underline"
          {...fontProps}
        >
          <Box as="span" {...fontProps}>
            {EXIT_UI_URL}
          </Box>
          <Box as="span" ml={1} {...fontProps}>
            <ArrowUpRight size={12} />
          </Box>
        </Link>{' '}
        to withdraw them.
      </Text>
    </Alert>
  )
}
