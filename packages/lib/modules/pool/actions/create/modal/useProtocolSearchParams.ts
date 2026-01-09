import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { isCowProtocol, isBalancerProtocol } from '../helpers'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { PoolType } from '@balancer/sdk'
import { usePoolCreationFormSteps } from '../usePoolCreationFormSteps'

interface UseProtocolSearchParams {
  onOpen: () => void
  poolType: GqlPoolType
}

export function useProtocolSearchParams({ onOpen, poolType }: UseProtocolSearchParams) {
  const searchParams = useSearchParams()

  const protocolSearchParam = searchParams.get('protocol')
  const { poolCreationForm, resetPoolCreationForm } = usePoolCreationForm()
  const { isFirstStep } = usePoolCreationFormSteps()

  const isProtocolParamCow = !!protocolSearchParam && isCowProtocol(protocolSearchParam)
  const isCowAmm = poolType === GqlPoolType.CowAmm
  const showCowAmmWarning = isProtocolParamCow && !isCowAmm && !isFirstStep

  const isProtocolParamBalancer = !!protocolSearchParam && isBalancerProtocol(protocolSearchParam)

  const showBalancerWarning = isProtocolParamBalancer && isCowAmm && !isFirstStep
  const showWarningModal = showCowAmmWarning || showBalancerWarning

  const setupCowCreation = () => {
    poolCreationForm.setValue('protocol', 'CoW')
    poolCreationForm.setValue('poolType', PoolType.CowAmm)
    poolCreationForm.trigger('protocol')
    poolCreationForm.trigger('poolType')
  }

  useEffect(() => {
    if (showWarningModal && !isFirstStep) {
      onOpen()
    } else if (isProtocolParamCow && !showCowAmmWarning && isFirstStep) {
      // Defer to next tick to ensure form is fully hydrated from localStorage
      setTimeout(() => {
        setupCowCreation()
      }, 0)
    } else if (isProtocolParamBalancer && !showBalancerWarning && isFirstStep) {
      setTimeout(() => {
        resetPoolCreationForm()
      }, 0)
    }
  }, [showWarningModal, isProtocolParamCow, isProtocolParamBalancer])

  return { setupCowCreation, showCowAmmWarning, showBalancerWarning }
}
