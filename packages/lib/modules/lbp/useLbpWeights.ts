import { useLbpForm } from './LbpFormProvider'
import { WeightAdjustmentType } from './lbp.types'

type LbpWeights = {
  projectTokenStartWeight: number
  projectTokenEndWeight: number
  reserveTokenStartWeight: number
  reserveTokenEndWeight: number
}

export function useLbpWeights(): LbpWeights {
  const {
    saleStructureForm: { watch },
  } = useLbpForm()
  const { weightAdjustmentType, customStartWeight, customEndWeight } = watch()

  const lbpWeightConfig = {
    [WeightAdjustmentType.LINEAR_90_10]: { start: 90, end: 10 },
    [WeightAdjustmentType.LINEAR_90_50]: { start: 90, end: 50 },
    [WeightAdjustmentType.CUSTOM]: { start: customStartWeight, end: customEndWeight },
  }

  const projectTokenStartWeight = lbpWeightConfig[weightAdjustmentType].start
  const reserveTokenStartWeight = 100 - projectTokenStartWeight
  const projectTokenEndWeight = lbpWeightConfig[weightAdjustmentType].end
  const reserveTokenEndWeight = 100 - projectTokenEndWeight

  return {
    projectTokenStartWeight,
    reserveTokenStartWeight,
    projectTokenEndWeight,
    reserveTokenEndWeight,
  }
}
