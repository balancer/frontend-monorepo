/* eslint-disable react-hooks/exhaustive-deps */
import { Permit2, PublicWalletClient } from '@balancer/sdk'
import { useToast } from '@chakra-ui/react'
import {
  SignatureState,
  isSignatureDisabled,
  isSignatureLoading,
} from '@repo/lib/modules/web3/signatures/signature.helpers'
import { useSdkWalletClient } from '@repo/lib/modules/web3/useSdkViemClient'
import { Toast } from '@repo/lib/shared/components/toasts/Toast'
import { useEffect, useState } from 'react'
import { useTokens } from '../../TokensProvider'
import { usePermit2Signature } from './Permit2SignatureProvider'
import { getTokenSymbolsForPermit2 } from './permit2.helpers'
import { NoncesByTokenAddress } from './usePermit2Allowance'
import { Address } from 'viem'

// eslint-disable-next-line no-unused-vars
export type SignPermit2Fn = (
  sdkClient: PublicWalletClient,
  nonces: NoncesByTokenAddress
) => Promise<Permit2 | undefined>

export type TokenAmountIn = {
  amount: bigint
  address: Address
}

export type BasePermit2Params = {
  tokenAmountsIn?: TokenAmountIn[]
  nonces?: NoncesByTokenAddress
  isPermit2: boolean
  wethIsEth: boolean
  isSimulationReady: boolean
  chainId: number
  signPermit2Fn: SignPermit2Fn
  spender: Address
}
export function useSignPermit2({
  tokenAmountsIn,
  nonces,
  wethIsEth,
  chainId,
  signPermit2Fn,
  isSimulationReady,
}: BasePermit2Params) {
  const sdkClient = useSdkWalletClient()

  const toast = useToast()
  const { getToken } = useTokens()

  const { signPermit2State, setSignPermit2State, setPermit2Signature } = usePermit2Signature()

  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (sdkClient === undefined) setSignPermit2State(SignatureState.Preparing)
  }, [sdkClient])

  useEffect(() => {
    if (isSimulationReady) {
      setPermit2Signature(undefined)
      setSignPermit2State(SignatureState.Ready)
    }
  }, [isSimulationReady])

  async function signPermit2() {
    if (!tokenAmountsIn) throw new Error('No tokenAmountsIn provided for permit2 signature')
    if (!nonces) throw new Error('No nonces provided for permit2 signature')
    if (!sdkClient) throw new Error('No sdkClient provided for permit2 signature')
    setSignPermit2State(SignatureState.Confirming)
    setError(undefined)

    try {
      const signature = await signPermit2Fn(sdkClient, nonces)

      if (signature) {
        setSignPermit2State(SignatureState.Completed)
        toast({
          title: 'Permit approval signed!',
          description: '',
          status: 'success',
          duration: 5000,
          isClosable: true,
          render: ({ ...rest }) => <Toast {...rest} />,
        })
      } else {
        setSignPermit2State(SignatureState.Ready)
      }

      setPermit2Signature(signature)
    } catch (error) {
      console.error(error)
      setError('Error in permit2 signature call')
      setSignPermit2State(SignatureState.Ready)
    }
  }

  return {
    signPermit2,
    signPermit2State,
    buttonLabel: getButtonLabel(
      signPermit2State,
      getTokenSymbolsForPermit2({ getToken, chainId, tokenAmountsIn, wethIsEth })
    ),
    isLoading: isSignatureLoading(signPermit2State) || !tokenAmountsIn,
    isDisabled: isSignatureDisabled(signPermit2State) || !nonces || !sdkClient,
    error,
  }
}

function getButtonLabel(signPermit2State: SignatureState, tokenSymbols?: (string | undefined)[]) {
  if (signPermit2State === SignatureState.Ready) return getReadyLabel(tokenSymbols)
  if (signPermit2State === SignatureState.Confirming) return 'Confirm signature in wallet'
  if (signPermit2State === SignatureState.Preparing) return 'Preparing'
  if (signPermit2State === SignatureState.Completed) return 'Permit Signed'
  return ''
}

function getReadyLabel(tokenSymbols?: (string | undefined)[]) {
  if (!tokenSymbols) return 'Sign token permit '
  if (tokenSymbols.length === 1) return 'Sign permit: ' + tokenSymbols[0]
  return 'Sign approvals: ' + tokenSymbols.join(', ')
}
