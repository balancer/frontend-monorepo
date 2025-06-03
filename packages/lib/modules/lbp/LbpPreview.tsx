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

  const saleStructureForm = watch()
  const chain = saleStructureForm.selectedChain
  const launchTokenAddress = saleStructureForm.launchTokenAddress
  const launchTokenMetadata = useTokenMetadata(launchTokenAddress, chain)
  const collateralTokenAddress = saleStructureForm.collateralTokenAddress
  const collateralToken = getToken(collateralTokenAddress, chain)
  const collateralTokenPrice = priceFor(collateralTokenAddress, chain)
  const weightAdjustmentType = saleStructureForm.weightAdjustmentType

  const startWeight = ['linear_90_10', 'linear_90_50'].includes(weightAdjustmentType)
    ? 90
    : saleStructureForm.customStartWeight

  const endWeight =
    weightAdjustmentType === 'linear_90_10'
      ? 10
      : weightAdjustmentType === 'linear_90_50'
        ? 50
        : saleStructureForm.customEndWeight

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
            startTime={saleStructureForm.startTime}
            endTime={saleStructureForm.endTime}
            startWeight={startWeight}
            endWeight={endWeight}
            launchTokenMetadata={launchTokenMetadata}
            collateralToken={collateralToken}
          />

          <ProjectedPrice
            startTime={saleStructureForm.startTime}
            endTime={saleStructureForm.endTime}
            startWeight={startWeight}
            endWeight={endWeight}
            launchTokenSeed={Number(saleStructureForm.saleTokenAmount)}
            launchTokenSymbol={launchTokenMetadata?.symbol || ''}
            collateralTokenSeed={Number(saleStructureForm.collateralTokenAmount)}
            collateralTokenPrice={collateralTokenPrice}
          />
        </VStack>
      </NoisyCard>

      <LearnMoreModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
