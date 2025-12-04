'use client'

import { useSignRelayerApproval } from '@repo/lib/modules/relayer/signRelayerApproval.hooks'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { Alert, Button, VStack } from '@chakra-ui/react'
import { TransactionStep } from './lib'
import { useMemo } from 'react'
import { NetworkSwitchButton, useChainSwitch } from '../../web3/useChainSwitch'
import { getChainId } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { SignatureState } from '../../web3/signatures/signature.helpers'
import { LabelWithIcon } from '@repo/lib/shared/components/btns/button-group/LabelWithIcon'

export const signRelayerStepTitle = 'Sign relayer'

interface SignRelayerButtonProps {
  error: string | undefined
  isConnected: boolean
  isLoading: boolean
  shouldChangeNetwork: boolean
  networkSwitchButtonProps: ReturnType<typeof useChainSwitch>['networkSwitchButtonProps']
  isDisabled: boolean
  buttonLabel: string
  signRelayer: () => void
}

function SignRelayerButton({
  error,
  isConnected,
  isLoading,
  shouldChangeNetwork,
  networkSwitchButtonProps,
  isDisabled,
  buttonLabel,
  signRelayer,
}: SignRelayerButtonProps) {
  return (
    <VStack width="full">
      {error && (
        <Alert rounded="md" status="error">
          {error}
        </Alert>
      )}
      {!isConnected && <ConnectWallet isLoading={isLoading} width="full" />}
      {shouldChangeNetwork && isConnected && <NetworkSwitchButton {...networkSwitchButtonProps} />}
      {!shouldChangeNetwork && isConnected && (
        <Button
          isDisabled={isDisabled}
          isLoading={isLoading}
          loadingText={buttonLabel}
          onClick={signRelayer}
          size="lg"
          variant="primary"
          w="full"
          width="full"
        >
          <LabelWithIcon icon="sign">{buttonLabel}</LabelWithIcon>
        </Button>
      )}
    </VStack>
  )
}

export function useSignRelayerStep(chain: GqlChain): TransactionStep {
  const chainId = getChainId(chain)
  const { isConnected } = useUserAccount()
  const { signRelayer, signRelayerState, isLoading, isDisabled, buttonLabel, error } =
    useSignRelayerApproval(chainId)
  const { shouldChangeNetwork, networkSwitchButtonProps } = useChainSwitch(chainId)

  const isComplete = signRelayerState === SignatureState.Completed

  return useMemo(
    () => ({
      id: 'sign-relayer',
      stepType: 'signBatchRelayer',
      details: { gasless: true },
      labels: {
        title: 'Sign relayer',
        init: 'Sign relayer',
        tooltip: 'Sign relayer',
      },
      isComplete: () => isComplete,
      renderAction: () => (
        <SignRelayerButton
          buttonLabel={buttonLabel}
          error={error}
          isConnected={isConnected}
          isDisabled={isDisabled}
          isLoading={isLoading}
          networkSwitchButtonProps={networkSwitchButtonProps}
          shouldChangeNetwork={shouldChangeNetwork}
          signRelayer={signRelayer}
        />
      ),
    }),

    [
      isComplete,
      isLoading,
      isConnected,
      error,
      shouldChangeNetwork,
      networkSwitchButtonProps,
      isDisabled,
      buttonLabel,
      signRelayer,
    ]
  )
}
