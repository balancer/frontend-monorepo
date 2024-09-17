import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { useToast } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useWalletClient } from 'wagmi'
import { signRelayerApproval } from './signRelayerApproval'
import { useHasApprovedRelayer } from './useHasApprovedRelayer'
import { RelayerMode } from './useRelayerMode'
import { SignRelayerState, useRelayerSignature } from './RelayerSignatureProvider'
import { SupportedChainId } from '@/lib/config/config.types'
import { Toast } from '@/lib/shared/components/toasts/Toast'

export function useShouldSignRelayerApproval(chainId: SupportedChainId, relayerMode: RelayerMode) {
  const { hasApprovedRelayer } = useHasApprovedRelayer(chainId)
  return relayerMode === 'signRelayer' && !hasApprovedRelayer
}

export function useSignRelayerApproval(chainId: SupportedChainId) {
  const toast = useToast()
  const { userAddress } = useUserAccount()

  const { setRelayerApprovalSignature, signRelayerState, setSignRelayerState } =
    useRelayerSignature()

  const [error, setError] = useState<string | undefined>()

  const { data: walletClient } = useWalletClient()

  useEffect(() => {
    if (walletClient === undefined) {
      setSignRelayerState(SignRelayerState.Preparing)
    } else {
      setSignRelayerState(SignRelayerState.Ready)
    }
  }, [setSignRelayerState, walletClient])

  async function signRelayer() {
    setSignRelayerState(SignRelayerState.Confirming)
    setError(undefined)

    try {
      const signature = await signRelayerApproval(userAddress, chainId, walletClient)

      if (signature) {
        setSignRelayerState(SignRelayerState.Completed)
        toast({
          title: 'Relayer approval signed!',
          description: '',
          status: 'success',
          duration: 5000,
          isClosable: true,
          render: ({ ...rest }) => <Toast {...rest} />,
        })
      } else {
        setSignRelayerState(SignRelayerState.Ready)
      }

      setRelayerApprovalSignature(signature)
    } catch (error) {
      // TODO: refactor when we define a global error handling UX pattern
      console.error(error)
      setError('Error in relayer signature call')
      setSignRelayerState(SignRelayerState.Ready)
    }
  }

  return {
    signRelayer,
    signRelayerState,
    buttonLabel: getButtonLabel(signRelayerState),
    isLoading: isLoading(signRelayerState),
    isDisabled: isDisabled(signRelayerState),
    error,
  }
}

function isDisabled(signRelayerState: SignRelayerState) {
  return (
    signRelayerState === SignRelayerState.Confirming ||
    signRelayerState === SignRelayerState.Completed
  )
}

function isLoading(signRelayerState: SignRelayerState) {
  return (
    signRelayerState === SignRelayerState.Confirming ||
    signRelayerState === SignRelayerState.Preparing
  )
}

function getButtonLabel(signRelayerState: SignRelayerState) {
  if (signRelayerState === SignRelayerState.Ready) return 'Sign relayer'
  if (signRelayerState === SignRelayerState.Confirming) return 'Confirm relayer signature in wallet'
  if (signRelayerState === SignRelayerState.Preparing) return 'Preparing'
  if (signRelayerState === SignRelayerState.Completed) return 'Relayer Signed'
  return ''
}
