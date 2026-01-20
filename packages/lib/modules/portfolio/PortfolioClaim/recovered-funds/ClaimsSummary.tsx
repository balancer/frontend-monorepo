import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useRecoveredFundsClaims } from './RecoveredFundsClaimsProvider'
import { Card, Checkbox, Divider, HStack, Text, VStack } from '@chakra-ui/react'
import {
  RecoveredTokenClaim,
  useRecoveredFunds,
  CHAINS,
  sumRecoveredFundsTotal,
} from './useRecoveredFunds'
import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import Image from 'next/image'
import { getChainName, getGqlChain, getNetworkConfig } from '@repo/lib/config/app.config'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useUnderlyingToken } from './useUnderlyingToken'

export function ClaimsSummary() {
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
        isChecked={hasAcceptedDisclaimer}
        isDisabled={signatureStep?.isComplete()}
        onChange={e => setHasAcceptedDisclaimer(e.target.checked)}
        size="lg"
      >
        <Text fontSize="sm">
          By accepting my share of the recovered funds from the v2 Composable Stable pool security
          incident, I hereby waive any future legal claims against Balancer.
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
  const totalAmount = sumRecoveredFundsTotal(chainClaims)

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
              {`${getChainName(chainId)} claims`}
            </Text>
          </HStack>

          <Text>{toCurrency(totalAmount)}</Text>
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
