import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useRecoveredFundsClaims } from './RecoveredFundsClaimsProvider'
import { Badge, Card, Checkbox, Divider, HStack, Link, Text, VStack } from '@chakra-ui/react'
import {
  RecoveredTokenClaim,
  useRecoveredFunds,
  CHAINS,
  sumRecoveredFundsTotal,
} from './useRecoveredFunds'
import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import Image from 'next/image'
import { getGqlChain, getNetworkConfig } from '@repo/lib/config/app.config'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useUnderlyingToken } from './useUnderlyingToken'
import { Dispatch, SetStateAction } from 'react'

export function ClaimsSummary({
  setShowSettlementTerms,
}: {
  setShowSettlementTerms: Dispatch<SetStateAction<boolean>>
}) {
  const { isMobile } = useBreakpoints()
  const { steps, hasAcceptedDisclaimer, setHasAcceptedDisclaimer } = useRecoveredFundsClaims()
  const { claims } = useRecoveredFunds()

  const signatureStep = steps.steps.find(step => step.stepType === 'signature')

  return (
    <AnimateHeightChange spacing="md">
      {isMobile && <MobileStepTracker chain={GqlChain.Mainnet} transactionSteps={steps} />}

      <Text fontSize="sm" variant="secondary">
        Some of your funds from affected v2 Composable Stable liquidity pools have been recovered.
        You can claim your share now below.
      </Text>

      <HStack>
        <Image alt="Merkl logo" height={20} src="/images/protocols/merkl.png" width={20}></Image>
        <Text fontSize="sm" variant="secondary">
          Claim powered by Merkl
        </Text>
      </HStack>

      {CHAINS.map(chainId => (
        <ChainClaimCard chainId={chainId} claims={claims} key={chainId} />
      ))}

      <ClaimsTotalCard claims={claims} />

      <Checkbox
        alignItems="flex-start"
        isChecked={hasAcceptedDisclaimer || signatureStep?.isComplete()}
        isDisabled={signatureStep?.isComplete()}
        onChange={e => setHasAcceptedDisclaimer(e.target.checked)}
        size="lg"
      >
        <Text fontSize="sm">
          I have read and agree to the terms and confirm my acceptance of the {''}
          <Link
            alignItems="center"
            display="inline-flex"
            onClick={() => setShowSettlementTerms(true)}
            textDecoration="underline"
          >
            Claim Settlement Terms
          </Link>
        </Text>
      </Checkbox>
    </AnimateHeightChange>
  )
}

type ChainClaimCardProps = {
  claims: RecoveredTokenClaim[]
  chainId: number
}

function ChainClaimCard({ claims, chainId }: ChainClaimCardProps) {
  const { toCurrency } = useCurrency()

  const networkConfig = getNetworkConfig(chainId)
  const chainClaims = claims.filter(claim => claim.chainId === chainId)
  if (chainClaims.length === 0) return null

  const totalAmount = sumRecoveredFundsTotal(chainClaims)
  const hasBeenClaimed = chainClaims.every(claim => claim.rawAmount === claim.claimedAmount)

  return (
    <Card paddingX={0} variant="modalSubSection">
      <VStack align="start" spacing="sm">
        <HStack justify="space-between" px="3" w="full">
          <HStack>
            <Image
              alt={`${networkConfig.shortName} logo`}
              height={20}
              src={networkConfig.iconPath}
              width={20}
            />
            <Text fontSize="sm" fontWeight="bold">
              {`${networkConfig.name} claims`}
            </Text>
          </HStack>

          {hasBeenClaimed ? (
            <Badge
              background="green.400"
              color="font.dark"
              fontSize="sm"
              textTransform="unset"
              userSelect="none"
            >
              Claimed
            </Badge>
          ) : (
            <Text>{toCurrency(totalAmount)}</Text>
          )}
        </HStack>

        <Divider p="0" />

        <VStack px="3" w="full">
          {chainClaims.map(claim => (
            <TokenClaim chainId={chainId} claim={claim} key={claim.amount.tokenAddress} />
          ))}
        </VStack>
      </VStack>
    </Card>
  )
}

type TokenClaimProps = {
  claim: RecoveredTokenClaim
  chainId: number
}

function TokenClaim({ claim, chainId }: TokenClaimProps) {
  const { address, isLoading } = useUnderlyingToken(claim.amount.tokenAddress, chainId)

  return (
    <TokenRow
      address={address}
      chain={getGqlChain(chainId)}
      isLoading={isLoading}
      key={claim.amount.tokenAddress}
      value={claim.amount.humanAmount}
    />
  )
}

type ClaimsTotalCardProps = {
  claims: RecoveredTokenClaim[]
}

function ClaimsTotalCard({ claims }: ClaimsTotalCardProps) {
  const { toCurrency } = useCurrency()

  return (
    <Card variant="modalSubSection">
      <HStack justify="space-between" w="full">
        <Text fontSize="sm" variant="secondary">
          Total
        </Text>
        <Text fontSize="sm" variant="secondary">
          {toCurrency(sumRecoveredFundsTotal(claims))}
        </Text>
      </HStack>
    </Card>
  )
}
