import { VStack, Heading, HStack } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { PreviewPoolType } from './PreviewPoolType'
import { PreviewPoolTokens } from './PreviewPoolTokens'
import { PreviewPoolTokensInWallet } from './PreviewPoolTokensInWallet'
import { PreviewPoolDetails } from './PreviewPoolDetails'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { RestartPoolCreationModal } from '../modal/RestartPoolCreationModal'
import { getGqlPoolType } from '../helpers'
import { LearnMoreModal } from '@repo/lib/shared/components/modals/LearnMoreModal'
import { PreviewAutoRangeConfig } from './PreviewAutoRangeConfig'
import { AutoRangeChartProvider } from '@repo/lib/modules/autorange/AutoRangeChartProvider'
import { EclpChartProvider } from '@repo/lib/modules/eclp/hooks/EclpChartProvider'
import { usePreviewAutoRangeChartData } from './usePreviewAutoRangeChartData'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { PreviewGyroEclpConfig } from './PreviewGyroEclpConfig'
import { usePreviewEclpLiquidityProfile } from './usePreviewEclpLiquidityProfile'
import { isGyroEllipticPool, isAutoRangePool } from '../helpers'
import { useWatch } from 'react-hook-form'
import { useProtocolSearchParams } from '../modal/useProtocolSearchParams'

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

  const gqlPoolType = getGqlPoolType(poolType)

  const { setupCowCreation, showCowAmmWarning, showBalancerWarning } = useProtocolSearchParams({
    poolType: gqlPoolType,
  })

  const handleRestart = () => {
    resetPoolCreationForm()
    if (showCowAmmWarning) setupCowCreation()
  }

  return (
    <HStack alignItems="center" justifyContent="space-between" w="full">
      <Heading color="font.maxContrast" size="md">
        Pool preview
      </Heading>
      <HStack cursor="pointer" spacing="xs" zIndex={1}>
        <RestartPoolCreationModal
          handleRestart={handleRestart}
          network={network}
          poolType={gqlPoolType}
          showBalancerWarning={showBalancerWarning}
          showCowAmmWarning={showCowAmmWarning}
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
  const { poolCreationForm, isBeforeStep } = usePoolCreationForm()
  const [poolType] = useWatch({ control: poolCreationForm.control, name: ['poolType'] })

  const eclpLiquidityProfile = usePreviewEclpLiquidityProfile()

  const autoRangeChartData = usePreviewAutoRangeChartData()
  const { lowerMarginValue, upperMarginValue } = autoRangeChartData || {}

  if (isGyroEllipticPool(poolType)) {
    return (
      <EclpChartProvider eclpLiquidityProfile={eclpLiquidityProfile}>
        <PreviewGyroEclpConfig />
      </EclpChartProvider>
    )
  }

  if (isAutoRangePool(poolType)) {
    return (
      <AutoRangeChartProvider chartData={autoRangeChartData}>
        <PreviewAutoRangeConfig
          isBeforeStep={isBeforeStep('Details')}
          lowerMarginValue={lowerMarginValue}
          upperMarginValue={upperMarginValue}
        />
      </AutoRangeChartProvider>
    )
  }

  return null
}
