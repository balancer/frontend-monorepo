'use client'

import { VStack, Heading, Button, Flex, Spacer, useDisclosure } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { useLbpForm } from './LbpFormProvider'
import { useTokenMetadata } from '../tokens/useTokenMetadata'
import { LearnMoreModal } from './header/LearnMoreModal'
import { useTokens } from '../tokens/TokensProvider'
import { TokenSummary } from './steps/preview/TokenSummary'
import { PoolWeights } from './steps/preview/PoolWeights'
import { ProjectedPrice } from './steps/preview/ProjectedPrice'

export function LbpPreview() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { getToken, priceFor } = useTokens()

  const {
    saleStructureForm: { watch },
  } = useLbpForm()

  const { projectInfoForm } = useLbpForm()

  const chain = watch('selectedChain')
  const launchTokenAddress = watch('launchTokenAddress')
  const launchTokenMetadata = useTokenMetadata(launchTokenAddress, chain)
  const launchTokenSeed = Number(watch('saleTokenAmount') || 0)

  const collateralTokenAddress = watch('collateralTokenAddress')
  const collateralToken = getToken(collateralTokenAddress, chain)
  const collateralTokenSeed = Number(watch('collateralTokenAmount') || 0)
  const collateralTokenPrice = priceFor(collateralTokenAddress, chain)

  const weightAdjustmentType = watch('weightAdjustmentType')
  const startWeight = ['linear_90_10', 'linear_90_50'].includes(weightAdjustmentType)
    ? 90
    : watch('customStartWeight')
  const endWeight =
    weightAdjustmentType === 'linear_90_10'
      ? 10
      : weightAdjustmentType === 'linear_90_50'
        ? 50
        : watch('customEndWeight')

  const startTime = watch('startTime')
  const endTime = watch('endTime')

  return (
    <>
      <NoisyCard
        cardProps={{
          w: 'full',
          overflow: 'hidden',
        }}
      >
        <VStack align="start" p="lg" spacing="lg" w="full">
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

          <PoolWeights
            startTime={startTime}
            endTime={endTime}
            startWeight={startWeight}
            endWeight={endWeight}
            launchTokenMetadata={launchTokenMetadata}
            collateralToken={collateralToken}
          />

          <ProjectedPrice
            startTime={startTime}
            endTime={endTime}
            startWeight={startWeight}
            endWeight={endWeight}
            launchTokenSeed={launchTokenSeed}
            launchTokenSymbol={launchTokenMetadata?.symbol || ''}
            collateralTokenSeed={collateralTokenSeed}
            collateralTokenPrice={collateralTokenPrice}
          />
        </VStack>
      </NoisyCard>

      <LearnMoreModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
