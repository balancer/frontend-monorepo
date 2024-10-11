/* eslint-disable react-hooks/exhaustive-deps */
import { Pool } from '@/lib/modules/pool/PoolProvider'
import { SdkQueryAddLiquidityOutput } from '@/lib/modules/pool/actions/add-liquidity/add-liquidity.types'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import {
  SignatureState,
  isSignatureDisabled,
  isSignatureLoading,
} from '@/lib/modules/web3/signatures/signature.helpers'
import { useSdkWalletClient } from '@/lib/modules/web3/useSdkViemClient'
import { Toast } from '@/lib/shared/components/toasts/Toast'
import { useToast } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useTokens } from '../../TokensProvider'
import { HumanTokenAmountWithAddress } from '../../token.types'
import { usePermit2Signature } from './Permit2SignatureProvider'
import { signPermit2Add } from './signPermit2Add'
import { NoncesByTokenAddress } from './usePermit2Allowance'
import { getTokenSymbolsForPermit2 } from './permit2.helpers'

export type AddLiquidityPermit2Params = {
  humanAmountsIn: HumanTokenAmountWithAddress[]
  pool: Pool
  queryOutput?: SdkQueryAddLiquidityOutput
  slippagePercent: string
  nonces?: NoncesByTokenAddress
  isPermit2: boolean
  wethIsEth: boolean
}
export function useSignPermit2({
  humanAmountsIn,
  queryOutput,
  slippagePercent,
  nonces,
  wethIsEth,
}: AddLiquidityPermit2Params) {
  const toast = useToast()
  const { userAddress } = useUserAccount()
  const { getToken } = useTokens()

  const { signPermit2State, setSignPermit2State, setPermit2Signature } = usePermit2Signature()

  const [error, setError] = useState<string | undefined>()

  const sdkClient = useSdkWalletClient()

  useEffect(() => {
    if (sdkClient === undefined) setSignPermit2State(SignatureState.Preparing)
  }, [sdkClient])

  //TODO: Generalize for Swaps and other potential signatures
  const hasBptOut = queryOutput?.sdkQueryOutput.bptOut.amount
  useEffect(() => {
    if (hasBptOut) {
      setPermit2Signature(undefined)
      setSignPermit2State(SignatureState.Ready)
    }
  }, [hasBptOut])

  async function signPermit2(pool: Pool) {
    if (!queryOutput) throw new Error('No input provided for permit2 signature')
    if (!nonces) throw new Error('No nonces provided for permit2 signature')
    setSignPermit2State(SignatureState.Confirming)
    setError(undefined)

    try {
      const signature = await signPermit2Add({
        pool,
        humanAmountsIn,
        wethIsEth,
        sdkClient,
        permit2Input: {
          account: userAddress,
          slippagePercent,
          sdkQueryOutput: queryOutput.sdkQueryOutput,
        },
        nonces,
      })

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
      getTokenSymbolsForPermit2({ getToken, queryOutput, wethIsEth })
    ),
    isLoading: isSignatureLoading(signPermit2State) || !queryOutput,
    isDisabled: isSignatureDisabled(signPermit2State),
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
