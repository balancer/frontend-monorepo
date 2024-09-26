import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Box, Button, ButtonProps, HStack, Img, Show } from '@chakra-ui/react'
import { CustomAvatar } from './CustomAvatar'
import { useUserAccount } from './UserAccountProvider'

export function ConnectWallet({ ...rest }: ButtonProps) {
  const { isLoading: isLoadingAccount, isConnected: isConnectedAccount } = useUserAccount()

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
          return (
            <Button
              variant="tertiary"
              onClick={openConnectModal}
              type="button"
              isDisabled={isLoading || !mounted}
              loadingText="Connect wallet"
              {...rest}
            >
              Connect wallet
            </Button>
          )
        }

        if (chain.unsupported) {
          return (
            <Button onClick={openChainModal} type="button" variant="tertiary" {...rest}>
              Unsupported network
            </Button>
          )
        }

        return (
          <HStack spacing="sm">
            <Button
              onClick={openChainModal}
              display="flex"
              alignItems="center"
              type="button"
              variant="tertiary"
              {...rest}
            >
              {chain.hasIcon && (
                <Box
                  width={6}
                  height={6}
                  borderRadius="full"
                  overflow="hidden"
                  mr={{ base: '0', sm: 'sm' }}
                >
                  {chain.iconUrl && (
                    <Img
                      alt={chain.name ?? 'Chain icon'}
                      src={chain.iconUrl}
                      width={6}
                      height={6}
                    />
                  )}
                </Box>
              )}
              <Show above="sm">{chain.name}</Show>
            </Button>
            <Button onClick={openAccountModal} variant="tertiary" {...rest}>
              <CustomAvatar
                ensImage={account.ensAvatar}
                address={account.address}
                alt="Avatar"
                size={6}
                rounded="full"
                mr={{ base: '0', sm: 'sm' }}
              />
              <Show above="sm">{account.displayName}</Show>
            </Button>
          </HStack>
        )
      }}
    </ConnectButton.Custom>
  )
}
