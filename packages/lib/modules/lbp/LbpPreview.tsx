import { VStack, Heading, Flex, Spacer, HStack } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { useLbpForm } from './LbpFormProvider'
import { useTokenMetadata } from '../tokens/useTokenMetadata'
import { RestartPoolCreationModal } from '../pool/actions/create/modal/RestartPoolCreationModal'
import { useTokens } from '../tokens/TokensProvider'
import { TokenSummary } from './steps/preview/TokenSummary'
import { PoolWeights } from './steps/preview/PoolWeights'
import { ProjectedPrice } from './steps/preview/ProjectedPrice'
import { SimpleInfoCard } from './steps/SimpleInfoCard'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { useLbpWeights } from './useLbpWeights'
import { Address } from 'viem'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { LbpLearnMoreModal } from './modal/LbpLearnMoreModal'
import { useWatch } from 'react-hook-form'

export function LbpPreview() {
  const { getToken, priceFor } = useTokens()

  const { saleStructureForm, resetLbpCreation } = useLbpForm()
  const [
    selectedChain,
    launchTokenAddress,
    collateralTokenAddress,
    endDateTime,
    startDateTime,
    collateralTokenAmount,
    saleTokenAmount,
  ] = useWatch({
    control: saleStructureForm.control,
    name: [
      'selectedChain',
      'launchTokenAddress',
      'collateralTokenAddress',
      'endDateTime',
      'startDateTime',
      'collateralTokenAmount',
      'saleTokenAmount',
    ],
  })

  const { isLastStep, projectInfoForm, updatePriceStats, maxPrice, saleMarketCap, fdvMarketCap } =
    useLbpForm()

  const launchTokenMetadata = useTokenMetadata(launchTokenAddress, selectedChain)
  const { projectTokenStartWeight: startWeight, projectTokenEndWeight: endWeight } = useLbpWeights()

  const tokenLoaded = !launchTokenMetadata.isLoading && !!launchTokenMetadata.symbol

  return (
    <>
      <NoisyCard
        cardProps={{
          w: 'full',
          overflow: 'hidden',
          rounded: 'xl',
        }}
      >
        <VStack align="start" px="lg" py="md" spacing="md" w="full">
          <Flex alignItems="center" pt="xs" w="full">
            <Heading color="font.maxContrast" size="md">
              LBP preview
            </Heading>
            <Spacer />
            <RestartPoolCreationModal
              handleRestart={resetLbpCreation}
              network={selectedChain}
              poolType={GqlPoolType.LiquidityBootstrapping}
            />
            <LbpLearnMoreModal buttonLabel="Get help" />
          </Flex>
          {!isLastStep && (
            <>
              <TokenSummary
                chain={selectedChain}
                launchTokenAddress={launchTokenAddress as Address}
                launchTokenMetadata={launchTokenMetadata}
                projectInfoForm={projectInfoForm}
              />
            </>
          )}

          {tokenLoaded && (
            <>
              <HStack alignItems="stretch" gap="ms" w="full">
                <SimpleInfoCard
                  info={`$${fNum('fiat', maxPrice)}`}
                  title={`${launchTokenMetadata.symbol} start price`}
                />
                <SimpleInfoCard info={saleMarketCap} title="Sale market cap" />
                <SimpleInfoCard info={fdvMarketCap} title="FDV market cap" />
              </HStack>

              <PoolWeights
                collateralToken={getToken(collateralTokenAddress, selectedChain)}
                endDateTime={endDateTime}
                endWeight={endWeight}
                launchTokenMetadata={launchTokenMetadata}
                startDateTime={startDateTime}
                startWeight={startWeight}
              />

              <ProjectedPrice
                collateralTokenPrice={priceFor(collateralTokenAddress, selectedChain)}
                collateralTokenSeed={Number(collateralTokenAmount)}
                endDateTime={endDateTime}
                endWeight={endWeight}
                launchTokenSeed={Number(saleTokenAmount)}
                launchTokenSymbol={launchTokenMetadata?.symbol || ''}
                onPriceChange={updatePriceStats}
                startDateTime={startDateTime}
                startWeight={startWeight}
              />
            </>
          )}
        </VStack>
      </NoisyCard>
    </>
  )
}
