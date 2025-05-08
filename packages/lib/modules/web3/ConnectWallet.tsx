import { Box, Button, ButtonProps, HStack, Img, Show } from '@chakra-ui/react'
import { useAppKit, useAppKitTheme } from '@reown/appkit/react'
import { chainImagesById } from '@repo/lib/modules/web3/ChainConfig'
import { useIsChainSupported } from '@repo/lib/shared/hooks/useIsChainSupported'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { useMainnetEnsData } from '@repo/lib/shared/hooks/useMainnetEnsAvatar'
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { formatAddress, formatENS } from '@repo/lib/shared/utils/addresses'
import { CustomAvatar } from './CustomAvatar'
import { useUserAccount } from './UserAccountProvider'
import { useIsSafeApp } from './safe.hooks'

export function ConnectWallet({
  connectLabel = 'Connect wallet',
  ...rest
}: { connectLabel?: string; showCreateWalletButton?: boolean } & ButtonProps) {
  const { isConnected: isConnectedAccount, chainId, chain, userAddress } = useUserAccount()

  const { ensAvatar, ensName } = useMainnetEnsData()

  const displayName = ensName ? formatENS(ensName) : formatAddress(userAddress)

  const isCurrentChainSupported = useIsChainSupported(chainId)
  const { open } = useAppKit()
  const isSafeApp = useIsSafeApp()
  const isMounted = useIsMounted()
  const { setThemeMode } = useAppKitTheme()
  const colorMode = useThemeColorMode()
  setThemeMode(colorMode)

  const isConnected = isMounted && isConnectedAccount

  if (!isConnected) {
    return (
      <HStack width="full">
        <Button
          isDisabled={!isMounted}
          loadingText={connectLabel}
          onClick={() => open()}
          type="button"
          variant="primary"
          {...rest}
        >
          {connectLabel}
        </Button>
      </HStack>
    )
  }
  if (!isCurrentChainSupported) {
    return (
      <Button
        onClick={() => open()}
        type="button"
        variant="tertiary"
        {...rest}
        isDisabled={isSafeApp}
      >
        Unsupported network
      </Button>
    )
  }
  if (!chain) return null
  const chainIconUrl = chainImagesById[chain.id]
  return (
    <HStack spacing="sm">
      <Button
        alignItems="center"
        display="flex"
        isDisabled={isSafeApp}
        onClick={() => open({ view: 'Networks' })}
        type="button"
        variant="tertiary"
        {...rest}
      >
        {chainIconUrl && (
          <Box
            borderRadius="full"
            height={6}
            mr={{ base: '0', sm: 'sm' }}
            overflow="hidden"
            width={6}
          >
            <Img alt={chain.name ?? 'Chain icon'} height={6} src={chainIconUrl} width={6} />
          </Box>
        )}
        <Show above="sm">{chain.name}</Show>
      </Button>
      <Button
        onClick={() => open({ view: 'Account' })}
        variant="tertiary"
        {...rest}
        isDisabled={isSafeApp}
      >
        <CustomAvatar
          address={userAddress}
          alt="Avatar"
          ensImage={ensAvatar}
          mr={{ base: '0', sm: 'sm' }}
          rounded="full"
          size={6}
        />
        <Show above="sm">{displayName}</Show>
      </Button>
    </HStack>
  )
  return <HStack />
}
