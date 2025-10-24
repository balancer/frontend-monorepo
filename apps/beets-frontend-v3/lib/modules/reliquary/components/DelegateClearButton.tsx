import { useDelegateClearStep } from '../hooks/useDelegateClearStep'
import { useDelegation } from '../lib/useDelegation'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export default function DelegateClearButton() {
  const { refetch } = useDelegation()
  const { step } = useDelegateClearStep(GqlChain.Sonic)

  // Add refetch callback to step
  const stepWithRefetch = {
    ...step,
    onSuccess: () => {
      step.onSuccess?.()
      refetch()
    },
  }

  return stepWithRefetch.renderAction()
}
