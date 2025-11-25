import { useWatch } from 'react-hook-form'
import { useLbpForm } from './LbpFormProvider'
import { WeightAdjustmentType } from './lbp.types'

type LbpWeights = {
  projectTokenStartWeight: number
  projectTokenEndWeight: number
  reserveTokenStartWeight: number
  reserveTokenEndWeight: number
}

export function useLbpWeights(): LbpWeights {
  const { saleStructureForm } = useLbpForm()
  const { weightAdjustmentType, customStartWeight, customEndWeight } = useWatch({
    control: saleStructureForm.control,
  })

  const lbpWeightConfig = {
    [WeightAdjustmentType.LINEAR_90_10]: { start: 90, end: 10 },
    [WeightAdjustmentType.LINEAR_90_50]: { start: 90, end: 50 },
    [WeightAdjustmentType.CUSTOM]: { start: customStartWeight || 0, end: customEndWeight || 0 },
  }

  const projectTokenStartWeight =
    lbpWeightConfig[weightAdjustmentType || WeightAdjustmentType.LINEAR_90_10].start
  const reserveTokenStartWeight = 100 - (projectTokenStartWeight || 0)
  const projectTokenEndWeight =
    lbpWeightConfig[weightAdjustmentType || WeightAdjustmentType.LINEAR_90_10].end
  const reserveTokenEndWeight = 100 - (projectTokenEndWeight || 0)

  return {
    projectTokenStartWeight,
    reserveTokenStartWeight,
    projectTokenEndWeight,
    reserveTokenEndWeight,
  }
}
