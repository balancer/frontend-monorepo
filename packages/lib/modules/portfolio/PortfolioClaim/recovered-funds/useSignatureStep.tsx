import { Button, VStack } from '@chakra-ui/react'
import {
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { NetworkSwitchButton, useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { LabelWithIcon } from '@repo/lib/shared/components/btns/button-group/LabelWithIcon'
import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { signatureRegistryAbi } from './signatureRegistryAbi'
import { useSdkWalletClient } from '@repo/lib/modules/web3/useSdkViemClient'
import terms from './terms'
import { Address, BaseError, ContractFunctionRevertedError } from 'viem'
import { getNetworkConfig } from '@repo/lib/config/networks'
import { getGqlChain } from '@repo/lib/config/app.config'

const STEP_ID = 'recovered-funds-signature'

const labels: TransactionLabels = {
  init: 'Sign indemnity release',
  title: 'Sign indemnity release',
  confirming: 'Signing...',
  confirmed: 'Signed!',
  tooltip: 'Sign indemnity release',
}

export function useSignatureStep(signatureChain: number) {
  const { isConnected, userAddress } = useUserAccount()
  const { shouldChangeNetwork, networkSwitchButtonProps } = useChainSwitch(signatureChain)
  const chain = getGqlChain(signatureChain)
  const signatureContract = getNetworkConfig(chain).contracts.signatureRegistry

  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false)
  const {
    hasAlreadySigned,
    isLoading: isSignatureLoading,
    error: fetchSignatureError,
    refetchSignature,
  } = useFetchSignature(signatureChain, signatureContract)

  const { sdkClient, isLoading: isWalletClientLoading } = useSdkWalletClient()
  const [isSigning, setIsSigning] = useState<boolean>(false)
  const [storeSignatureError, setStoreSignatureError] = useState<string | undefined>(undefined)

  const isLoading = isWalletClientLoading || isSignatureLoading

  async function storeSignature() {
    if (!sdkClient) return
    if (!signatureContract) throw new Error(`Signature contract not found for chain: ${chain}`)

    try {
      const signature = await sdkClient.signMessage({
        account: userAddress,
        message: terms,
      })

      const { request } = await sdkClient.simulateContract({
        account: userAddress,
        address: signatureContract,
        abi: signatureRegistryAbi,
        functionName: 'recordSignatureFor',
        args: [signature, userAddress],
      })

      await sdkClient.writeContract(request)

      await refetchSignature()
      //setIsSigning(false)
    } catch (err) {
      if (err instanceof BaseError) {
        const revertError = err.walk(err => err instanceof ContractFunctionRevertedError)
        if (revertError instanceof ContractFunctionRevertedError) {
          setStoreSignatureError(revertError.data?.errorName ?? err.shortMessage)
          setIsSigning(false)
          return
        }
      }

      setStoreSignatureError((err as Error).message)
      setIsSigning(false)
    }
  }

  const error = fetchSignatureError || storeSignatureError

  const step: TransactionStep = {
    id: STEP_ID,
    labels,
    stepType: 'signature',
    isComplete: () => isConnected && hasAlreadySigned,
    renderAction: () => (
      <VStack width="full">
        {error && <BalAlert content={error} status="error" />}
        {!isConnected && <ConnectWallet isLoading={isLoading} width="full" />}
        {shouldChangeNetwork && isConnected && (
          <NetworkSwitchButton {...networkSwitchButtonProps} />
        )}

        {!shouldChangeNetwork && isConnected ? (
          <Button
            isDisabled={!isConnected || !hasAcceptedDisclaimer || (isSigning && !hasAlreadySigned)}
            onClick={() => {
              setIsSigning(true)
              storeSignature()
            }}
            size="lg"
            variant="primary"
            w="full"
          >
            <LabelWithIcon icon="sign">
              {isSigning && !hasAlreadySigned ? labels.confirming : labels.init}
            </LabelWithIcon>
          </Button>
        ) : null}
      </VStack>
    ),
  }

  return {
    signatureStep: step,
    hasAcceptedDisclaimer,
    setHasAcceptedDisclaimer,
  }
}

function useFetchSignature(signatureChain: number, signatureContract: Address | undefined) {
  const { userAddress } = useUserAccount()
  const { shouldChangeNetwork } = useChainSwitch(signatureChain)

  const query = useReadContract({
    chainId: signatureChain,
    abi: signatureRegistryAbi,
    address: signatureContract,
    functionName: 'signatures',
    args: [userAddress],
    query: { enabled: userAddress && !shouldChangeNetwork && !!signatureContract },
  })

  return {
    hasAlreadySigned: query.data !== '0x',
    isLoading: query.isLoading,
    error: query.error?.message,
    refetchSignature: query.refetch,
  }
}
