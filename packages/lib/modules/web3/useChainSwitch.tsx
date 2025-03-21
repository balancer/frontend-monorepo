/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useSwitchChain } from 'wagmi'
import { Button } from '@chakra-ui/react'
import { getChainShortName } from '@repo/lib/config/app.config'
import { SupportedChainId } from '@repo/lib/config/config.types'
import { useUserAccount } from './UserAccountProvider'
import { useIsSafeApp } from './safe.hooks'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'

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
    networkSwitchButtonProps,
  }
}

export interface NetworkSwitchButtonProps {
  name: string
  switchChain?: (variables: { chainId: SupportedChainId }) => void
  chainId: SupportedChainId
  isPending: boolean
}

type Props = { chainId: SupportedChainId }
export function NetworkSwitchButton({ chainId }: Props) {
  const { shouldChangeNetwork, networkSwitchButtonProps } = useChainSwitch(chainId)
  const isSafeApp = useIsSafeApp()

  if (!shouldChangeNetwork) return

  if (isSafeApp) return <SwitchNetworkAlert chainName={getChainShortName(chainId)} />

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

// Show an alert to switch network as Safe App does not support programmatic network switch
export function SwitchNetworkAlert({ chainName }: { chainName: string }) {
  const content = `Please switch your Safe to ${chainName} network to continue`
  return <BalAlert content={content} status="warning" />
}
