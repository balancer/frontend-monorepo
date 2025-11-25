'use client'

import { Badge, Button, Grid, GridItem, Heading, Skeleton, Tooltip } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'
import { useDelegateSetStep } from '../../hooks/useDelegateSetStep'
import { useDelegateClearStep } from '../../hooks/useDelegateClearStep'
import { useDelegation } from '../../hooks/useDelegation'
import { useReliquary } from '../../ReliquaryProvider'

export function MyRelicsHeader() {
  const { totalMaBeetsVP, isLoading } = useReliquary()
  const { data: isDelegatedToMDs } = useDelegation()
  const { step: delegateSetStep } = useDelegateSetStep(GqlChain.Sonic)
  const { step: delegateClearStep } = useDelegateClearStep(GqlChain.Sonic)
  const router = useRouter()

  return (
    <Grid
      alignItems="center"
      gap={{ base: '1', lg: '4' }}
      templateAreas={{
        base: `"title create"
               "vp vp"
               "delegate delegate"`,
        lg: `"title vp delegate create"`,
      }}
      templateColumns={{ base: '1fr 1fr', lg: 'auto auto auto 1fr' }}
      w="full"
    >
      <GridItem area="title">
        <Heading
          background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
          backgroundClip="text"
          size="lg"
        >
          My relics
        </Heading>
      </GridItem>

      <GridItem area="vp" mt={{ base: '2', lg: '0' }} w="full">
        <Tooltip label="This is your current maBEETS Voting Power. Depending on when you level up or invest/withdraw, it might be different to what is shown on the latest vote on Snapshot.">
          {!isLoading ? (
            <Badge colorScheme="orange" p="2" rounded="md">
              <Heading size="sm" textAlign="center" textTransform="initial">
                {fNumCustom(totalMaBeetsVP, '0.000a')} maBEETS voting power
              </Heading>
            </Badge>
          ) : (
            <Skeleton height="24px" />
          )}
        </Tooltip>
      </GridItem>

      <GridItem area="delegate" justifySelf="start" mt={{ base: '2', lg: '0' }} w="full">
        <Tooltip label="Delegate or undelegate your maBEETS voting power to the Music Directors. This only affects the delegation for the Beets space on Snapshot.">
          {isDelegatedToMDs ? delegateClearStep.renderAction() : delegateSetStep.renderAction()}
        </Tooltip>
      </GridItem>

      <GridItem area="create" justifySelf="end">
        <Button onClick={() => router.push('/mabeets/deposit')} size="md" variant="primary">
          Create New Relic
        </Button>
      </GridItem>
    </Grid>
  )
}
