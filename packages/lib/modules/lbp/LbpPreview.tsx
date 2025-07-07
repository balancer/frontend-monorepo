import { VStack, Heading, Button, Flex, Spacer, useDisclosure, HStack } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { useLbpForm } from './LbpFormProvider'
import { useTokenMetadata } from '../tokens/useTokenMetadata'
import { LearnMoreModal } from './header/LearnMoreModal'
import { useTokens } from '../tokens/TokensProvider'
import { TokenSummary } from './steps/preview/TokenSummary'
import { PoolWeights } from './steps/preview/PoolWeights'
import { ProjectedPrice } from './steps/preview/ProjectedPrice'
import { SimpleInfoCard } from './steps/SimpleInfoCard'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { useLbpWeights } from './useLbpWeights'

export function LbpPreview() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { getToken, priceFor } = useTokens()

  const {
    saleStructureForm: { watch },
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
        }}
      >
        <VStack align="start" p="lg" spacing="lg" w="full">
          {!isLastStep && (
            <>
              <Flex w="full">
                <Heading color="font.maxContrast" size="md">
                  LBP Preview
                </Heading>

                <Spacer />

                <Button
                  _hover={{ color: 'font.linkHover' }}
                  color="font.link"
                  onClick={onOpen}
                  position="relative"
                  top="4px"
                  variant="ghost"
                >
                  Get help
                </Button>
              </Flex>

              <TokenSummary
                chain={chain}
                launchTokenMetadata={launchTokenMetadata}
                projectInfoForm={projectInfoForm}
              />
            </>
          )}

          {tokenLoaded && (
            <>
              <HStack alignItems="stretch" w="full">
                <SimpleInfoCard
                  info={`$${fNum('fiat', maxPrice)}`}
                  title={`${launchTokenMetadata.symbol} start price`}
                />
                <SimpleInfoCard info={saleMarketCap} title="Sale market cap" />
                <SimpleInfoCard info={fdvMarketCap} title="FDV market cap" />
              </HStack>

              <PoolWeights
                collateralToken={getToken(collateralTokenAddress, chain)}
                endTime={saleStructureData.endTime}
                endWeight={endWeight}
                launchTokenMetadata={launchTokenMetadata}
                startTime={saleStructureData.startTime}
                startWeight={startWeight}
              />

              <ProjectedPrice
                collateralTokenPrice={priceFor(collateralTokenAddress, chain)}
                collateralTokenSeed={Number(saleStructureData.collateralTokenAmount || 0)}
                endTime={saleStructureData.endTime}
                endWeight={endWeight}
                launchTokenSeed={Number(saleStructureData.saleTokenAmount || 0)}
                launchTokenSymbol={launchTokenMetadata?.symbol || ''}
                onPriceChange={updatePriceStats}
                startTime={saleStructureData.startTime}
                startWeight={startWeight}
              />
            </>
          )}
        </VStack>
      </NoisyCard>

      <LearnMoreModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
