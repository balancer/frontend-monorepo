import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { PoolType } from '@balancer/sdk'
import { isGyroEllipticPool, isReClammPool } from '@repo/lib/modules/pool/actions/create/helpers'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { VStack, UnorderedList, ListItem } from '@chakra-ui/react'

export function SeedPoolAlert({ poolType }: { poolType: PoolType }) {
  const { poolAddress } = usePoolCreationForm()
  const { projectName } = PROJECT_CONFIG

  const reclammContent = poolAddress
    ? 'When you enter a seed amount for one of the ReClamm pool tokens, the other amount is proportionally autofilled to maintain the required price ratio for pool initialization.'
    : 'The reCLAMM pool type requires you to deploy the pool contract before initial token amounts can be chosen.'

  const gyroEclpContent =
    'When you enter a seed amount for one of the Gyro ECLP tokens, the other amount is proportionally autofilled to maintain the recommended price ratio for pool initialization.'

  const poolSpecificContent = isReClammPool(poolType)
    ? reclammContent
    : isGyroEllipticPool(poolType)
      ? gyroEclpContent
      : null

  if (poolSpecificContent) {
    return (
      <VStack>
        <BalAlert content={poolSpecificContent} status="info" />
        {isReClammPool(poolType) && poolAddress && (
          <BalAlert
            content="If the token amounts are too small, the transaction simulation may revert because of on chain rounding issues."
            status="warning"
          />
        )}
      </VStack>
    )
  }

  return (
    <BalAlert
      content={
        <UnorderedList>
          <ListItem color="black">
            The pool will only be listed on the {projectName} UI once it is seeded.
          </ListItem>
          <ListItem color="black">
            Be very careful that the USD values you add are proportional to the target token
            weights, or you’ll likely get rekt.{' '}
          </ListItem>
          <ListItem color="black">
            Note: LPs are required to make proportional adds when the liquidity of the pool is less
            than $50k.
          </ListItem>
        </UnorderedList>
      }
      status="info"
    />
  )
}
