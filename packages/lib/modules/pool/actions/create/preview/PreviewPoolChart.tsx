import { Control } from 'react-hook-form'
import { PoolCreationForm } from '../types'
import { useWatch } from 'react-hook-form'
import { usePoolCreationFormSteps } from '../usePoolCreationFormSteps'
import { usePreviewEclpLiquidityProfile } from './usePreviewEclpLiquidityProfile'
import { usePreviewReclAmmChartData } from './usePreviewReclammChartData'
import { isGyroEllipticPool, isReClammPool } from '../helpers'
import { EclpChartProvider } from '@repo/lib/modules/eclp/hooks/EclpChartProvider'
import { ReclAmmChartProvider } from '@repo/lib/modules/reclamm/ReclAmmChartProvider'
import { PreviewGyroEclpConfig } from './PreviewGyroEclpConfig'
import { PreviewReClammConfig } from './PreviewReClammConfig'

export function PreviewPoolChart({ control }: { control: Control<PoolCreationForm> }) {
  const [poolType] = useWatch({ control, name: ['poolType'] })
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
