/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useSwitchChain } from 'wagmi'
import { Button } from '@chakra-ui/react'
import { getChainShortName } from '@repo/lib/config/app.config'
import { SupportedChainId } from '@repo/lib/config/config.types'
import { useUserAccount } from './UserAccountProvider'

export function useChainSwitch(chainId: SupportedChainId) {
  const { chain: connectedChain } = useUserAccount()
  const { isPending, switchChain } = useSwitchChain()

  const shouldChangeNetwork = chainId !== connectedChain?.id

  const networkSwitchButtonProps = {
    name: getChainShortName(chainId),
    switchChain,
    chainId,
    isPending,
  }

  return {
    shouldChangeNetwork,
    NetworkSwitchButton,
    networkSwitchButtonProps,
  }
}

export interface NetworkSwitchButtonProps {
  name: string
  switchChain?: (variables: { chainId: SupportedChainId }) => void
  chainId: SupportedChainId
  isPending: boolean
}

export function NetworkSwitchButton({ ...networkSwitchButtonProps }: NetworkSwitchButtonProps) {
  return (
    <Button
      isLoading={networkSwitchButtonProps.isPending}
      onClick={() =>
        networkSwitchButtonProps.switchChain?.({ chainId: networkSwitchButtonProps.chainId })
      }
      size="lg"
      variant="primary"
      w="full"
    >
      Switch network to {networkSwitchButtonProps.name}
    </Button>
  )
}
