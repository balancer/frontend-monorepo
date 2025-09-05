import { VStack, Heading, Flex, Spacer, HStack } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { useLbpForm } from './LbpFormProvider'
import { useTokenMetadata } from '../tokens/useTokenMetadata'
import { RestartPoolCreationModal } from '../pool/actions/create/modal/RestartPoolCreationModal'
import { LearnMoreModal } from './header/LearnMoreModal'
import { useTokens } from '../tokens/TokensProvider'
import { TokenSummary } from './steps/preview/TokenSummary'
import { PoolWeights } from './steps/preview/PoolWeights'
import { ProjectedPrice } from './steps/preview/ProjectedPrice'
import { SimpleInfoCard } from './steps/SimpleInfoCard'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { useLbpWeights } from './useLbpWeights'
import { Address } from 'viem'

export function LbpPreview() {
  const { getToken, priceFor } = useTokens()

  const {
    saleStructureForm: { watch },
    resetLbpCreation,
  } = useLbpForm()
  const saleStructureData = watch()

  const { isLastStep, projectInfoForm, updatePriceStats, maxPrice, saleMarketCap, fdvMarketCap } =
    useLbpForm()

  const chain = saleStructureData.selectedChain
  const launchTokenAddress = saleStructureData.launchTokenAddress
  const launchTokenMetadata = useTokenMetadata(launchTokenAddress, chain)

  const collateralTokenAddress = saleStructureData.collateralTokenAddress

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
        <VStack align="start" p="lg" spacing="md" w="full">
          {!isLastStep && (
            <>
              <Flex alignItems="center" w="full">
                <Heading color="font.maxContrast" size="md">
                  LBP preview
                </Heading>
                <Spacer />
                <RestartPoolCreationModal
                  handleRestart={resetLbpCreation}
                  network={chain}
                  poolType="Liquidity Bootstrapping"
                />
                <LearnMoreModal buttonLabel="Get help" />
              </Flex>
              <TokenSummary
                chain={chain}
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
                collateralToken={getToken(collateralTokenAddress, chain)}
                endDateTime={saleStructureData.endDateTime}
                endWeight={endWeight}
                launchTokenMetadata={launchTokenMetadata}
                startDateTime={saleStructureData.startDateTime}
                startWeight={startWeight}
              />

              <ProjectedPrice
                collateralTokenPrice={priceFor(collateralTokenAddress, chain)}
                collateralTokenSeed={Number(saleStructureData.collateralTokenAmount || 0)}
                endDateTime={saleStructureData.endDateTime}
                endWeight={endWeight}
                launchTokenSeed={Number(saleStructureData.saleTokenAmount || 0)}
                launchTokenSymbol={launchTokenMetadata?.symbol || ''}
                onPriceChange={updatePriceStats}
                startDateTime={saleStructureData.startDateTime}
                startWeight={startWeight}
              />
            </>
          )}
        </VStack>
      </NoisyCard>
    </>
  )
}
