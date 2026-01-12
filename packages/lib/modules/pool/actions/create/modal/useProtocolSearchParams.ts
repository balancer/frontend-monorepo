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
  const { poolCreationForm, resetPoolCreationForm } = usePoolCreationForm()
  const { isFirstStep } = usePoolCreationFormSteps()
  const searchParams = useSearchParams()

  const protocolSearchParam = searchParams.get('protocol')

  const isProtocolParamCow = !!protocolSearchParam && isCowProtocol(protocolSearchParam)
  const isProtocolParamBalancer = !!protocolSearchParam && isBalancerProtocol(protocolSearchParam)
  const isCowAmm = poolType === GqlPoolType.CowAmm

  const showCowAmmWarning = isProtocolParamCow && !isCowAmm && !isFirstStep
  const showBalancerWarning = isProtocolParamBalancer && isCowAmm && !isFirstStep

  const shouldShowWarningModal = showCowAmmWarning || showBalancerWarning
  const shouldSwitchToCowProtocol = isProtocolParamCow && !showCowAmmWarning && isFirstStep
  const shouldSwitchToBalancerProtocol =
    isProtocolParamBalancer && !showBalancerWarning && isFirstStep

  const setupCowCreation = () => {
    poolCreationForm.setValue('protocol', 'CoW')
    poolCreationForm.setValue('poolType', PoolType.CowAmm)
    poolCreationForm.trigger('protocol')
    poolCreationForm.trigger('poolType')
  }

  useEffect(() => {
    if (shouldShowWarningModal) {
      onOpen()
    } else if (shouldSwitchToCowProtocol) {
      // setTimeout defers to next tick to ensure form is fully hydrated from localStorage,
      // otherwise form state fails to update when user navigating from another page that is not "/create"
      setTimeout(() => setupCowCreation(), 0)
    } else if (shouldSwitchToBalancerProtocol) {
      setTimeout(() => resetPoolCreationForm(), 0)
    }
  }, [shouldShowWarningModal, shouldSwitchToCowProtocol, shouldSwitchToBalancerProtocol])

  return { setupCowCreation, showCowAmmWarning, showBalancerWarning }
}
