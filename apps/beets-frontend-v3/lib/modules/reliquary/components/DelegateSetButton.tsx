import { useDelegateSetStep } from '../hooks/useDelegateSetStep'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export default function DelegateSetButton() {
  const { step } = useDelegateSetStep(GqlChain.Sonic)
  return step.renderAction()
}
