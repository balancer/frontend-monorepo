import { ConnectButton, WalletButton } from '@rainbow-me/rainbowkit'
import { Box, Button, ButtonProps, HStack, Img, Show } from '@chakra-ui/react'
import { CustomAvatar } from './CustomAvatar'
import { useUserAccount } from './UserAccountProvider'
import { useIsSafeApp } from './safe.hooks'
import { AnalyticsEvent, trackEvent } from '@repo/lib/shared/services/fathom/Fathom'

export function ConnectWallet({
  connectLabel = 'Connect wallet',
  showCreateWalletButton = false,
  ...rest
}: { connectLabel?: string; showCreateWalletButton?: boolean } & ButtonProps) {
  const { isLoading: isLoadingAccount, isConnected: isConnectedAccount } = useUserAccount()
  const isSafeApp = useIsSafeApp()

  return (
    <ConnectButton.Custom>
      {({
        mounted,
        openConnectModal,
        authenticationStatus,
        account,
        chain,
        openChainModal,
        openAccountModal,
      }) => {
        const isReady = mounted && authenticationStatus !== 'loading'
        const isLoading = authenticationStatus === 'loading' || isLoadingAccount
        const isConnected =
          isReady &&
          account &&
          chain &&
          isConnectedAccount &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        if (!isConnected) {
          const handleConnectClick = () => {
            trackEvent(AnalyticsEvent.ClickNavUtilitiesWalletConnect)
            openConnectModal()
          }

          return (
            <HStack width="full">
              {showCreateWalletButton && (
                <WalletButton.Custom wallet="coinbase">
                  {({ ready, connect }) => {
                    return (
                      <Button
                        disabled={!ready || !mounted || isLoading}
                        onClick={connect}
                        type="button"
                        variant="tertiary"
                      >
                        Create wallet
                      </Button>
                    )
                  }}
                </WalletButton.Custom>
              )}
              <Button
                isDisabled={isLoading || !mounted}
                loadingText={connectLabel}
                onClick={handleConnectClick}
                type="button"
                variant="primary"
                {...rest}
              >
                {connectLabel}
              </Button>
            </HStack>
          )
        }

        if (chain.unsupported) {
          return (
            <Button
              onClick={openChainModal}
              type="button"
              variant="tertiary"
              {...rest}
              isDisabled={isSafeApp}
            >
              Unsupported network
            </Button>
          )
        }

        const handleNetworkClick = () => {
          trackEvent(AnalyticsEvent.ClickNavUtilitiesNetwork)
          openChainModal()
        }

        const handleWalletClick = () => {
          trackEvent(AnalyticsEvent.ClickNavUtilitiesWalletChange)
          openAccountModal()
        }

        return (
          <HStack spacing="sm">
            <Button
              alignItems="center"
              display="flex"
              isDisabled={isSafeApp}
              onClick={handleNetworkClick}
              type="button"
              variant="tertiary"
              {...rest}
            >
              {chain.hasIcon && (
                <Box
                  borderRadius="full"
                  height={6}
                  mr={{ base: '0', sm: 'sm' }}
                  overflow="hidden"
                  width={6}
                >
                  {chain.iconUrl && (
                    <Img
                      alt={chain.name ?? 'Chain icon'}
                      height={6}
                      src={chain.iconUrl}
                      width={6}
                    />
                  )}
                </Box>
              )}
              <Show above="sm">{chain.name}</Show>
            </Button>
            <Button onClick={handleWalletClick} variant="tertiary" {...rest} isDisabled={isSafeApp}>
              <CustomAvatar
                address={account.address}
                alt="Avatar"
                ensImage={account.ensAvatar}
                mr={{ base: '0', sm: 'sm' }}
                rounded="full"
                size={6}
              />
              <Show above="sm">{account.displayName}</Show>
            </Button>
          </HStack>
        )
      }}
    </ConnectButton.Custom>
  )
}
