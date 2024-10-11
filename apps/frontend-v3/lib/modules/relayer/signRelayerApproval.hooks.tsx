import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { useToast } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { signRelayerApproval } from './signRelayerApproval'
import { useHasApprovedRelayer } from './useHasApprovedRelayer'
import { RelayerMode } from './useRelayerMode'
import { useRelayerSignature } from './RelayerSignatureProvider'
import { SupportedChainId } from '@/lib/config/config.types'
import { Toast } from '@/lib/shared/components/toasts/Toast'
import { useSdkWalletClient } from '../web3/useSdkViemClient'
import {
  SignatureState,
  isSignatureDisabled,
  isSignatureLoading,
} from '../web3/signatures/signature.helpers'

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

  const sdkClient = useSdkWalletClient()

  useEffect(() => {
    if (sdkClient === undefined) {
      setSignRelayerState(SignatureState.Preparing)
    } else {
      setSignRelayerState(SignatureState.Ready)
    }
  }, [setSignRelayerState, sdkClient])

  async function signRelayer() {
    setSignRelayerState(SignatureState.Confirming)
    setError(undefined)

    try {
      const signature = await signRelayerApproval(userAddress, chainId, sdkClient)

      if (signature) {
        setSignRelayerState(SignatureState.Completed)
        toast({
          title: 'Relayer approval signed!',
          description: '',
          status: 'success',
          duration: 5000,
          isClosable: true,
          render: ({ ...rest }) => <Toast {...rest} />,
        })
      } else {
        setSignRelayerState(SignatureState.Ready)
      }

      setRelayerApprovalSignature(signature)
    } catch (error) {
      console.error(error)
      setError('Error in relayer signature call')
      setSignRelayerState(SignatureState.Ready)
    }
  }

  return {
    signRelayer,
    signRelayerState,
    buttonLabel: getButtonLabel(signRelayerState),
    isLoading: isSignatureLoading(signRelayerState),
    isDisabled: isSignatureDisabled(signRelayerState),
    error,
  }
}

function getButtonLabel(signRelayerState: SignatureState) {
  if (signRelayerState === SignatureState.Ready) return 'Sign relayer'
  if (signRelayerState === SignatureState.Confirming) return 'Confirm relayer signature in wallet'
  if (signRelayerState === SignatureState.Preparing) return 'Preparing'
  if (signRelayerState === SignatureState.Completed) return 'Relayer Signed'
  return ''
}
