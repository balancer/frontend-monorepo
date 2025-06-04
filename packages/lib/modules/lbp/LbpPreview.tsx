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
import { useState } from 'react'
import { fNum } from '@repo/lib/shared/utils/numbers'

export function LbpPreview() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { getToken, priceFor } = useTokens()

  const {
    saleStructureForm: { watch },
  } = useLbpForm()
  const saleStructureData = watch()

  const { isLastStep, projectInfoForm } = useLbpForm()

  const chain = saleStructureData.selectedChain
  const launchTokenAddress = saleStructureData.launchTokenAddress
  const launchTokenMetadata = useTokenMetadata(launchTokenAddress, chain)
  const launchTokenSeed = Number(saleStructureData.saleTokenAmount || 0)

  const collateralTokenAddress = saleStructureData.collateralTokenAddress

  const weightAdjustmentType = saleStructureData.weightAdjustmentType
  const startWeight = ['linear_90_10', 'linear_90_50'].includes(weightAdjustmentType)
    ? 90
    : saleStructureData.customStartWeight
  const endWeight =
    weightAdjustmentType === 'linear_90_10'
      ? 10
      : weightAdjustmentType === 'linear_90_50'
        ? 50
        : saleStructureData.customEndWeight

  const [maxPrice, setMaxPrice] = useState(0)
  const [saleMarketCap, setSaleMarketCap] = useState('')
  const [fdvMarketCap, setFdvMarketCap] = useState('')
  const updateStats = (prices: number[][]) => {
    const minPrice = Math.min(...prices.map(point => point[1]))
    const maxPrice = Math.max(...prices.map(point => point[1]))
    const minSaleMarketCap = minPrice * launchTokenSeed
    const maxSaleMarketCap = maxPrice * launchTokenSeed
    const minFdvMarketCap = minPrice * (launchTokenMetadata.totalSupply || 0)
    const maxFdvMarketCap = maxPrice * (launchTokenMetadata.totalSupply || 0)
    setMaxPrice(maxPrice)
    setSaleMarketCap(`$${fNum('fiat', minSaleMarketCap)} - $${fNum('fiat', maxSaleMarketCap)}`)
    setFdvMarketCap(`$${fNum('fiat', minFdvMarketCap)} - $${fNum('fiat', maxFdvMarketCap)}`)
  }

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
            onPriceChange={updateStats}
          />
        </VStack>
      </NoisyCard>

      <LearnMoreModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
