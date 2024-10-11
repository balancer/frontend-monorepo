/* eslint-disable react-hooks/exhaustive-deps */
import { Pool } from '@/lib/modules/pool/PoolProvider'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { useSdkWalletClient } from '@/lib/modules/web3/useSdkViemClient'
import { Toast } from '@/lib/shared/components/toasts/Toast'
import { useToast } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { usePermitSignature } from '../permit2/PermitSignatureProvider'
import { SdkQueryRemoveLiquidityOutput } from '@/lib/modules/pool/actions/remove-liquidity/remove-liquidity.types'
import {
  SignatureState,
  isSignatureDisabled,
  isSignatureLoading,
} from '@/lib/modules/web3/signatures/signature.helpers'
import { signRemoveLiquidityPermit } from './signRemoveLiquidityPermit'

export type RemoveLiquidityPermitParams = {
  pool: Pool
  wethIsEth: boolean
  queryOutput?: SdkQueryRemoveLiquidityOutput
  slippagePercent: string
}
export function useSignPermit({
  pool,
  wethIsEth,
  queryOutput,
  slippagePercent,
}: RemoveLiquidityPermitParams) {
  const toast = useToast()
  const { userAddress } = useUserAccount()

  const { setSignPermitState, setPermitSignature, signPermitState } = usePermitSignature()

  const [error, setError] = useState<string | undefined>()

  const sdkClient = useSdkWalletClient()

  useEffect(() => {
    if (sdkClient === undefined) {
      setSignPermitState(SignatureState.Preparing)
    } else {
      setSignPermitState(SignatureState.Ready)
    }
  }, [setSignPermitState, sdkClient])

  async function signPermit() {
    if (!queryOutput) throw new Error('No input provided for permit signature')
    setSignPermitState(SignatureState.Confirming)
    setError(undefined)

    try {
      const signature = await signRemoveLiquidityPermit({
        sdkClient,
        permitInput: {
          account: userAddress,
          slippagePercent,
          sdkQueryOutput: queryOutput.sdkQueryOutput,
        },
        wethIsEth,
      })

      if (signature) {
        setSignPermitState(SignatureState.Completed)
        toast({
          title: 'Approval signed!',
          description: '',
          status: 'success',
          duration: 5000,
          isClosable: true,
          render: ({ ...rest }) => <Toast {...rest} />,
        })
      } else {
        setSignPermitState(SignatureState.Ready)
      }

      setPermitSignature(signature)
    } catch (error) {
      console.error(error)
      setError('Error in permit signature call')
      setSignPermitState(SignatureState.Ready)
    }
  }

  return {
    signPermit,
    signPermitState,
    buttonLabel: getButtonLabel(signPermitState, pool.symbol),
    isLoading: isSignatureLoading(signPermitState) || !queryOutput,
    isDisabled: isSignatureDisabled(signPermitState),
    error,
  }
}

function getButtonLabel(signPermitState: SignatureState, poolSymbol?: string) {
  if (signPermitState === SignatureState.Ready) return getReadyLabel(poolSymbol)
  if (signPermitState === SignatureState.Confirming) return 'Confirm approval with signature'
  if (signPermitState === SignatureState.Preparing) return 'Preparing'
  if (signPermitState === SignatureState.Completed) return 'Approval signed'
  return ''
}

function getReadyLabel(poolSymbol?: string) {
  if (!poolSymbol) return 'Sign approval'
  return 'Sign approval: ' + poolSymbol
}
