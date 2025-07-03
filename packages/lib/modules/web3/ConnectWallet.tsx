import { ConnectButton, WalletButton } from '@rainbow-me/rainbowkit'
import { Button, ButtonProps, HStack, Show } from '@chakra-ui/react'
import { CustomAvatar } from './CustomAvatar'
import { useUserAccount } from './UserAccountProvider'
import { useIsSafeApp } from './safe.hooks'

type ConnectWalletProps = {
  /** Text for the connect button (default: "Connect wallet") */
  connectLabel?: string
  /** Show a “Create wallet” button (Coinbase) when disconnected */
  showCreateWalletButton?: boolean
} & ButtonProps

export function ConnectWallet({
  connectLabel = 'Connect wallet',
  showCreateWalletButton = false,
  ...rest
}: ConnectWalletProps) {
  const { isLoading: isLoadingAccount, isConnected: isConnectedAccount } = useUserAccount()
  const isSafeApp = useIsSafeApp()

  return (
    <ConnectButton.Custom>
      {({ mounted, openConnectModal, authenticationStatus, account, openAccountModal }) => {
        /* ----- connection state helpers ----- */
        const isReady = mounted && authenticationStatus !== 'loading'
        const isLoading = authenticationStatus === 'loading' || isLoadingAccount
        const isConnected =
          isReady &&
          account &&
          isConnectedAccount &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        /* ------- NOT CONNECTED: show “connect” (+ optional “create”) ------- */
        if (!isConnected) {
          return (
            <HStack width="">
              {showCreateWalletButton && (
                <WalletButton.Custom wallet="coinbase">
                  {({ ready, connect }) => (
                    <Button
                      isDisabled={!ready || !mounted || isLoading}
                      onClick={connect}
                      variant="tertiary"
                      type="button"
                    >
                      Create wallet
                    </Button>
                  )}
                </WalletButton.Custom>
              )}

              <Button
                isDisabled={isLoading || !mounted}
                loadingText={connectLabel}
                onClick={openConnectModal}
                backgroundColor="#00F5E0"
                color="black"
                {...rest}
              >
                {connectLabel}
              </Button>
            </HStack>
          )
        }

        /* ------------- CONNECTED: avatar + address only ------------- */
        return (
          <Button
            onClick={openAccountModal}
            backgroundColor="#00F5E0"
            color="black"
            isDisabled={isSafeApp}
            display="flex"
            alignItems="center"
            {...rest}
          >
            <CustomAvatar
              address={account.address}
              alt="Avatar"
              ensImage={account.ensAvatar}
              mr={{ base: 0, sm: 'sm' }}
              rounded="full"
              size={6}
            />

            {/* hide text on very small screens */}
            <Show above="sm">{account.displayName}</Show>
          </Button>
        )
      }}
    </ConnectButton.Custom>
  )
}
