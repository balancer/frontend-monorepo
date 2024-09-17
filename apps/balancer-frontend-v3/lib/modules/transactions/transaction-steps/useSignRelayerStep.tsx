'use client'

import { useSignRelayerApproval } from '@/lib/modules/relayer/signRelayerApproval.hooks'
import { ConnectWallet } from '@/lib/modules/web3/ConnectWallet'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { Alert, Button, VStack } from '@chakra-ui/react'
import { TransactionStep } from './lib'
import { SignRelayerState } from '../../relayer/RelayerSignatureProvider'
import { useMemo } from 'react'
import { useChainSwitch } from '../../web3/useChainSwitch'
import { getChainId } from '@/lib/config/app.config'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'

export const signRelayerStepTitle = 'Sign relayer'

export function useSignRelayerStep(chain: GqlChain): TransactionStep {
  const chainId = getChainId(chain)
  const { isConnected } = useUserAccount()
  const { signRelayer, signRelayerState, isLoading, isDisabled, buttonLabel, error } =
    useSignRelayerApproval(chainId)
  const { shouldChangeNetwork, NetworkSwitchButton, networkSwitchButtonProps } =
    useChainSwitch(chainId)

  const SignRelayerButton = () => (
    <VStack width="full">
      {error && (
        <Alert rounded="md" status="error">
          {error}
        </Alert>
      )}
      {!isConnected && <ConnectWallet width="full" isLoading={isLoading} />}
      {shouldChangeNetwork && isConnected && <NetworkSwitchButton {...networkSwitchButtonProps} />}
      {!shouldChangeNetwork && isConnected && (
        <Button
          width="full"
          w="full"
          size="lg"
          variant="primary"
          isDisabled={isDisabled}
          isLoading={isLoading}
          onClick={signRelayer}
          loadingText={buttonLabel}
        >
          {buttonLabel}
        </Button>
      )}
    </VStack>
  )

  const isComplete = () => signRelayerState === SignRelayerState.Completed

  return useMemo(
    () => ({
      id: 'sign-relayer',
      stepType: 'signBatchRelayer',
      labels: {
        title: 'Sign relayer',
        init: 'Sign relayer',
        tooltip: 'Sign relayer',
      },
      isComplete,
      renderAction: () => <SignRelayerButton />,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signRelayerState, isLoading, isConnected]
  )
}
