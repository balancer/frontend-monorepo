/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useSwitchChain } from 'wagmi'
import { Button } from '@chakra-ui/react'
import { getChainShortName } from '@/lib/config/app.config'
import { SupportedChainId } from '@/lib/config/config.types'
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

export const NetworkSwitchButton: React.FC<NetworkSwitchButtonProps> = function ({
  ...networkSwitchButtonProps
}) {
  return (
    <Button
      w="full"
      size="lg"
      variant="primary"
      onClick={() =>
        networkSwitchButtonProps.switchChain?.({ chainId: networkSwitchButtonProps.chainId })
      }
      isLoading={networkSwitchButtonProps.isPending}
    >
      Switch network to {networkSwitchButtonProps.name}
    </Button>
  )
}
