import { useLbpForm } from './LbpFormProvider'

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
    linear_90_10: { start: 90, end: 10 },
    linear_90_50: { start: 90, end: 50 },
    custom: { start: customStartWeight, end: customEndWeight },
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
