import { SaleStructureStep } from './steps/SaleStructureStep'
import { ProjectInfoStep } from './steps/ProjectInfoStep'
import { ReviewStep } from './steps/review/ReviewStep'
import { FormStep } from '@repo/lib/shared/hooks/useFormSteps'
import { UserActions, WeightAdjustmentType } from './lbp.types'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { ProjectInfoForm, SaleStructureForm } from './lbp.types'

export const LBP_FORM_STEPS: FormStep[] = [
  { id: 'step-1-sale-structure', title: 'Sale structure', Component: SaleStructureStep },
  { id: 'step-2-project-info', title: 'Project info', Component: ProjectInfoStep },
  { id: 'step-3-review', title: 'Review', Component: ReviewStep },
]

export const INITIAL_SALE_STRUCTURE: SaleStructureForm = {
  selectedChain: PROJECT_CONFIG.defaultNetwork,
  launchTokenAddress: '',
  saleType: '',
  userActions: UserActions.BUY_AND_SELL,
  fee: 1.0,
  startDateTime: '',
  endDateTime: '',
  collateralTokenAddress: '',
  weightAdjustmentType: WeightAdjustmentType.LINEAR_90_10,
  customStartWeight: 90,
  customEndWeight: 10,
  saleTokenAmount: '',
  collateralTokenAmount: '',
}

export const INITIAL_PROJECT_INFO: ProjectInfoForm = {
  name: '',
  description: '',
  tokenIconUrl: '',
  websiteUrl: '',
  xHandle: '',
  telegramHandle: '',
  discordUrl: '',
  owner: '',
  poolCreator: '',
  disclaimerAccepted: false,
}
