'use client'

import { Button, VStack } from '@chakra-ui/react'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { useMemo } from 'react'

import { useTokens } from '../../tokens/TokensProvider'
import {
  filterTokensForPermit2,
  getTokenAddressesForPermit2,
  getTokenSymbolsForPermit2,
  hasValidPermit2,
} from '../../tokens/approvals/permit2/permit2.helpers'
import { usePermit2Allowance } from '../../tokens/approvals/permit2/usePermit2Allowance'
import { BasePermit2Params, useSignPermit2 } from '../../tokens/approvals/permit2/useSignPermit2'
import { SignatureState } from '../../web3/signatures/signature.helpers'
import { NetworkSwitchButton, useChainSwitch } from '../../web3/useChainSwitch'
import { StepDetails, TransactionStep } from './lib'
import { LabelWithIcon } from '@repo/lib/shared/components/btns/button-group/LabelWithIcon'
import { getGqlChain } from '@repo/lib/config/app.config'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

/*
  Returns a transaction step to sign a permit2 for the token amounts in
  If the permit2 allowance is expired for one of the positive token amounts in: returns undefined
 */
export function useSignPermit2Step(params: BasePermit2Params): TransactionStep | undefined {
  const { isConnected, userAddress } = useUserAccount()
  const { getToken } = useTokens()

  const { chainId, tokenAmountsIn, spender, isPermit2, wethIsEth } = params

  const { isLoadingPermit2Allowances, nonces, expirations, allowedAmounts } = usePermit2Allowance({
    chainId,
    tokenAddresses: getTokenAddressesForPermit2(tokenAmountsIn),
    owner: userAddress,
    enabled: isPermit2 && !!spender,
    spender: spender,
  })

  const filteredTokenAmountsIn = filterTokensForPermit2({
    chain: getGqlChain(chainId),
    wethIsEth,
    tokenAmountsIn,
  })

  const isValidPermit2 = hasValidPermit2(filteredTokenAmountsIn, expirations, allowedAmounts)

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

  const { shouldChangeNetwork, networkSwitchButtonProps } = useChainSwitch(chainId)

  const isLoading =
    isLoadingSignature ||
    isLoadingPermit2Allowances ||
    signPermit2State === SignatureState.Confirming

  function SignPermitButton() {
    return (
      <VStack width="full">
        {error && <BalAlert content={error} status="error" />}
        {!isConnected && <ConnectWallet isLoading={isLoading} width="full" />}
        {shouldChangeNetwork && isConnected && (
          <NetworkSwitchButton {...networkSwitchButtonProps} />
        )}
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
            <LabelWithIcon icon="sign">{buttonLabel}</LabelWithIcon>
          </Button>
        ) : null}
      </VStack>
    )
  }

  const isComplete = () => signPermit2State === SignatureState.Completed || isValidPermit2

  const details: StepDetails = {
    gasless: true,
    batchApprovalTokens: getTokenSymbolsForPermit2({
      chainId,
      getToken,
      tokenAmountsIn,
      wethIsEth: params.wethIsEth,
    }),
  }

  return useMemo(
    () => {
      if (!isPermit2) return
      return {
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
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signPermit2State, isLoading, isConnected, isValidPermit2, shouldChangeNetwork]
  )
}

function getTitle(details?: StepDetails): string {
  if (!details?.batchApprovalTokens) return `Permit on ${PROJECT_CONFIG.projectName}`
  if (details.batchApprovalTokens.length === 1) {
    return `${details.batchApprovalTokens[0]}: Permit on ${PROJECT_CONFIG.projectName}`
  }
  return 'Sign token approvals'
}
