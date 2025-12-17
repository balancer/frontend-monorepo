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
import { LearnMoreModal } from '@repo/lib/shared/components/modals/LearnMoreModal'
import { PreviewReClammConfig } from './PreviewReClammConfig'
import { ReclAmmChartProvider } from '@repo/lib/modules/reclamm/ReclAmmChartProvider'
import { EclpChartProvider } from '@repo/lib/modules/eclp/hooks/EclpChartProvider'
import { usePreviewReclAmmChartData } from './usePreviewReclammChartData'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { PreviewGyroEclpConfig } from './PreviewGyroEclpConfig'
import { usePreviewEclpLiquidityProfile } from './usePreviewEclpLiquidityProfile'
import { isGyroEllipticPool, isReClammPool } from '../helpers'
import { useWatch } from 'react-hook-form'

export function PreviewPoolCreation() {
  return (
    <NoisyCard
      cardProps={{
        w: 'full',
        overflow: 'hidden',
        rounded: 'xl',
      }}
    >
      <VStack align="start" p="lg" spacing="md" w="full">
        <PreviewPoolHeader />
        <PreviewPoolType />
        <PreviewPoolChart />
        <PreviewPoolTokens />
        <PreviewPoolTokensInWallet />
        <PreviewPoolDetails />
      </VStack>
    </NoisyCard>
  )
}

function PreviewPoolHeader() {
  const { resetPoolCreationForm, poolCreationForm } = usePoolCreationForm()
  const [network, poolType] = useWatch({
    control: poolCreationForm.control,
    name: ['network', 'poolType'],
  })

  return (
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
        <LearnMoreModal
          buttonLabel="Get help"
          docsUrl="https://docs.balancer.fi/concepts/explore-available-balancer-pools/"
          headerText="Learn more about pool types"
          listItems={[
            `${PROJECT_CONFIG.projectName} offers a variety of liquidity pool types, each tailored to specific use cases`,
          ]}
          showHelpIcon
        />
      </HStack>
    </HStack>
  )
}

function PreviewPoolChart() {
  const { poolCreationForm } = usePoolCreationForm()
  const [poolType] = useWatch({ control: poolCreationForm.control, name: ['poolType'] })
  const { isBeforeStep } = usePoolCreationFormSteps()

  const eclpLiquidityProfile = usePreviewEclpLiquidityProfile()

  const reclammChartData = usePreviewReclAmmChartData()
  const { lowerMarginValue, upperMarginValue } = reclammChartData || {}

  if (isGyroEllipticPool(poolType)) {
    return (
      <EclpChartProvider eclpLiquidityProfile={eclpLiquidityProfile}>
        <PreviewGyroEclpConfig />
      </EclpChartProvider>
    )
  }

  if (isReClammPool(poolType)) {
    return (
      <ReclAmmChartProvider chartData={reclammChartData}>
        <PreviewReClammConfig
          isBeforeStep={isBeforeStep('Details')}
          lowerMarginValue={lowerMarginValue}
          upperMarginValue={upperMarginValue}
        />
      </ReclAmmChartProvider>
    )
  }

  return null
}
