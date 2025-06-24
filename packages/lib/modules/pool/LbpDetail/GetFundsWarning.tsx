import { Alert, AlertDescription, AlertIcon, AlertTitle, HStack, Spacer } from '@chakra-ui/react'
import { BalAlertButtonLink } from '@repo/lib/shared/components/alerts/BalAlertButtonLink'
import { AlertTriangle } from 'react-feather'
import { getPoolPath } from '../pool.utils'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { usePool } from '../PoolProvider'

export function GetFundsWarning() {
  const { pool } = usePool()

  const path = getPoolPath({
    id: pool.address,
    chain: pool.chain,
    type: GqlPoolType.LiquidityBootstrapping,
    protocolVersion: 3 as const,
  })

  return (
    <Alert status="warning">
      <AlertIcon as={AlertTriangle} />

      <HStack>
        <AlertTitle>Access the funds that you raised</AlertTitle>
        <AlertDescription>
          Now that the sale has ended, get your funds into your wallet
        </AlertDescription>
      </HStack>

      <Spacer />

      <BalAlertButtonLink external={false} href={`${path}/remove-liquidity`}>
        Get funds
      </BalAlertButtonLink>
    </Alert>
  )
}
