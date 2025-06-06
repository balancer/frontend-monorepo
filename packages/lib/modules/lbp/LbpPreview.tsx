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
                  position="relative"
                  top="4px"
                  variant="ghost"
                  onClick={onOpen}
                >
                  Get help
                </Button>
              </Flex>

              <TokenSummary
                chain={chain}
                projectInfoForm={projectInfoForm}
                launchTokenMetadata={launchTokenMetadata}
              />
            </>
          )}

          {tokenLoaded && (
            <>
              <HStack w="full">
                <SimpleInfoCard
                  title={`${launchTokenMetadata.symbol} start price`}
                  info={`$${fNum('fiat', maxPrice)}`}
                />
                <SimpleInfoCard title="Sale market cap" info={saleMarketCap} />
                <SimpleInfoCard title="FDV market cap" info={fdvMarketCap} />
              </HStack>

              <PoolWeights
                startTime={saleStructureData.startTime}
                endTime={saleStructureData.endTime}
                startWeight={startWeight}
                endWeight={endWeight}
                launchTokenMetadata={launchTokenMetadata}
                collateralToken={getToken(collateralTokenAddress, chain)}
              />

              <ProjectedPrice
                startTime={saleStructureData.startTime}
                endTime={saleStructureData.endTime}
                startWeight={startWeight}
                endWeight={endWeight}
                launchTokenSeed={launchTokenSeed}
                launchTokenSymbol={launchTokenMetadata?.symbol || ''}
                collateralTokenSeed={Number(saleStructureData.collateralTokenAmount || 0)}
                collateralTokenPrice={priceFor(collateralTokenAddress, chain)}
                onPriceChange={updatePriceStats}
              />
            </>
          )}
        </VStack>
      </NoisyCard>

      <LearnMoreModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
