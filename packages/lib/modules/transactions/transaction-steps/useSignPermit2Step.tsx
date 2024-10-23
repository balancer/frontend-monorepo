'use client'

import { Button, VStack } from '@chakra-ui/react'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { useMemo } from 'react'

import { useTokens } from '../../tokens/TokensProvider'
import {
  getTokenAddressesForPermit,
  getTokenSymbolsForPermit,
  hasValidPermit2,
} from '../../tokens/approvals/permit2/permit2.helpers'
import { usePermit2Allowance } from '../../tokens/approvals/permit2/usePermit2Allowance'
import { BasePermit2Params, useSignPermit2 } from '../../tokens/approvals/permit2/useSignPermit2'
import { SignatureState } from '../../web3/signatures/signature.helpers'
import { useChainSwitch } from '../../web3/useChainSwitch'
import { StepDetails, TransactionStep } from './lib'

/*
  Returns a transaction step to sign a permit2 for the token amounts in
  If the permit2 allowance is expired for one of the positive token amounts in: returns undefined
 */
export function useSignPermit2Step(params: BasePermit2Params): TransactionStep | undefined {
  const { isConnected, userAddress } = useUserAccount()
  const { getToken } = useTokens()

  const { chainId, tokenAmountsIn } = params

  const { isLoadingPermit2Allowances, nonces, expirations, allowedAmounts } = usePermit2Allowance({
    chainId,
    tokenAddresses: getTokenAddressesForPermit({
      chainId,
      tokenAmountsIn: params.tokenAmountsIn,
      wethIsEth: params.wethIsEth,
    }),
    owner: userAddress,
    enabled: params.isPermit2,
  })

  const isValidPermit2 = hasValidPermit2(tokenAmountsIn, expirations, allowedAmounts)

  const {
    signPermit2,
    signPermit2State,
    isLoading: isLoadingSignature,
    isDisabled,
    buttonLabel,
    error,
  } = useSignPermit2({
    ...params,
    nonces,
  })

  const { shouldChangeNetwork, NetworkSwitchButton, networkSwitchButtonProps } =
    useChainSwitch(chainId)

  const isLoading =
    isLoadingSignature ||
    isLoadingPermit2Allowances ||
    signPermit2State === SignatureState.Confirming

  function SignPermitButton() {
    return (
      <VStack width="full">
        {error ? <BalAlert content={error} status="error" /> : null}
        {!isConnected && <ConnectWallet isLoading={isLoading} width="full" />}
        {shouldChangeNetwork && isConnected ? (
          <NetworkSwitchButton {...networkSwitchButtonProps} />
        ) : null}
        {!shouldChangeNetwork && isConnected ? (
          <Button
            isDisabled={isDisabled}
            isLoading={isLoading}
            loadingText={buttonLabel}
            onClick={() => signPermit2()}
            size="lg"
            variant="primary"
            w="full"
            width="full"
          >
            {buttonLabel}
          </Button>
        ) : null}
      </VStack>
    )
  }

  const isComplete = () => signPermit2State === SignatureState.Completed || isValidPermit2

  const details: StepDetails = {
    gasless: true,
    batchApprovalTokens: getTokenSymbolsForPermit({
      chainId,
      getToken,
      tokenAmountsIn,
      wethIsEth: params.wethIsEth,
    }),
  }

  return useMemo(
    () => ({
      id: 'sign-permit2',
      stepType: 'signPermit2',
      details,
      labels: {
        title: getTitle(details),
        init: `Sign permit`,
        tooltip: 'Sign permit',
      },
      isComplete,
      renderAction: () => <SignPermitButton />,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signPermit2State, isLoading, isConnected, isValidPermit2],
  )
}

function getTitle(details?: StepDetails): string {
  if (!details?.batchApprovalTokens) return `Permit on balancer`
  if (details.batchApprovalTokens.length === 1) {
    return `${details.batchApprovalTokens[0]}: Permit on balancer`
  }
  return 'Sign token approvals'
}
