import { useDelegateClearStep } from '../hooks/useDelegateClearStep'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export default function DelegateClearButton() {
  const { step } = useDelegateClearStep(GqlChain.Sonic)
  return step.renderAction()
}
