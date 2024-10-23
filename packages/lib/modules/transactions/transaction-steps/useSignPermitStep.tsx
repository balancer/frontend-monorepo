'use client'

import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { Button, HStack, VStack, Text, Spacer } from '@chakra-ui/react'
import { useMemo } from 'react'
import {
  RemoveLiquidityPermitParams,
  useSignPermit as useSignPermit,
} from '../../tokens/approvals/permit/useSignPermit'
import { useChainSwitch } from '../../web3/useChainSwitch'
import { TransactionStep } from './lib'
import { getChainId } from '@repo/lib/config/app.config'
import { SignIcon } from '@repo/lib/shared/components/icons/SignIcon'
import { primaryTextColor } from '@repo/lib/shared/services/chakra/themes/bal/colors'
import { SignatureState } from '../../web3/signatures/signature.helpers'

export function useSignPermitStep(params: RemoveLiquidityPermitParams): TransactionStep {
  const { isConnected } = useUserAccount()

  const { signPermit, signPermitState, isLoading, isDisabled, buttonLabel, error } = useSignPermit({
    ...params,
  })
  const { shouldChangeNetwork, NetworkSwitchButton, networkSwitchButtonProps } = useChainSwitch(
    getChainId(params.pool.chain)
  )

  function SignPermitButton() {
    return (
      <VStack width="full">
        {error && <BalAlert content={error} status="error" />}
        {!isConnected && <ConnectWallet isLoading={isLoading} width="full" />}
        {shouldChangeNetwork && isConnected && (
          <NetworkSwitchButton {...networkSwitchButtonProps} />
        )}
        {!shouldChangeNetwork && isConnected && (
          <Button
            isDisabled={isDisabled}
            isLoading={isLoading}
            loadingText={buttonLabel}
            onClick={signPermit}
            size="lg"
            variant="primary"
            w="full"
            width="full"
          >
            <HStack spacing="sm" width="100%">
              <Text color={primaryTextColor} fontWeight="bold">
                {buttonLabel}
              </Text>
              <Spacer />
              <SignIcon size={16} />
            </HStack>
          </Button>
        )}
      </VStack>
    )
  }

  const isComplete = () => signPermitState === SignatureState.Completed

  return useMemo(
    () => ({
      id: 'sign-permit',
      stepType: 'signPermit',
      details: { gasless: true },
      labels: {
        title: `Permit pool token on Balancer`,
        init: `Sign permit`,
        tooltip: 'Sign permit',
      },
      isComplete,
      renderAction: () => <SignPermitButton />,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signPermitState, isLoading, isConnected]
  )
}
