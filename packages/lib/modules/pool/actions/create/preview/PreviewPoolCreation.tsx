import { VStack, Heading, HStack } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { PreviewPoolType } from './PreviewPoolType'
import { PreviewPoolTokens } from './PreviewPoolTokens'
import { PreviewPoolTokensInWallet } from './PreviewPoolTokensInWallet'
import { PreviewPoolDetails } from './PreviewPoolDetails'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { usePoolCreationFormSteps } from '../usePoolCreationFormSteps'
import { RestartPoolCreationModal } from '../modal/RestartPoolCreationModal'
import { getGqlPoolType } from '../helpers'
import { LearnMoreModal } from '@repo/lib/modules/lbp/header/LearnMoreModal'
import { PreviewReClammConfig } from './PreviewReClammConfig'
import { ReclAmmChartProvider } from '@repo/lib/modules/reclamm/ReclAmmChartProvider'
import { usePreviewReclAmmChartData } from './usePreviewReclammChartData'

export function PreviewPoolCreation() {
  const { resetPoolCreationForm, network, poolType, isReClamm } = usePoolCreationForm()
  const { isBeforeStep } = usePoolCreationFormSteps()
  const reclammChartData = usePreviewReclAmmChartData()
  const { lowerMarginValue, upperMarginValue } = reclammChartData || {}

  return (
    <NoisyCard
      cardProps={{
        w: 'full',
        overflow: 'hidden',
        rounded: 'xl',
      }}
    >
      <VStack align="start" p="lg" spacing="md" w="full">
        <HStack alignItems="center" justifyContent="space-between" w="full">
          <Heading color="font.maxContrast" size="md">
            Pool preview
          </Heading>
          <HStack cursor="pointer" spacing="xs" zIndex={1}>
            <RestartPoolCreationModal
              handleRestart={resetPoolCreationForm}
              network={network}
              poolType={getGqlPoolType(poolType)}
            />
            <LearnMoreModal buttonLabel="Get help" subject="pool type" />
          </HStack>
        </HStack>

        <PreviewPoolType />
        {isReClamm && (
          <ReclAmmChartProvider chartData={reclammChartData}>
            <PreviewReClammConfig
              isBeforeStep={isBeforeStep('Details')}
              lowerMarginValue={lowerMarginValue}
              upperMarginValue={upperMarginValue}
            />
          </ReclAmmChartProvider>
        )}
        <PreviewPoolTokens />
        <PreviewPoolTokensInWallet />
        <PreviewPoolDetails />
      </VStack>
    </NoisyCard>
  )
}
