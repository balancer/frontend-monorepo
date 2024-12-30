import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Box, Button, ButtonProps, HStack, Img, Show } from '@chakra-ui/react'
import { CustomAvatar } from './CustomAvatar'
import { useUserAccount } from './UserAccountProvider'

export function ConnectWallet({ ...rest }: ButtonProps) {
  const { isLoading, isConnected: isConnectedAccount } = useUserAccount()

  return (
    <ConnectButton.Custom>
      {({ mounted, openConnectModal, account, chain, openChainModal, openAccountModal }) => {
        const isConnected = mounted && account && chain && isConnectedAccount

        console.log({
          mounted,
          account,
          chain,
          isConnectedAccount,
        })

        if (!isConnected) {
          return (
            <Button
              isDisabled={isLoading || !mounted}
              loadingText="Connect wallet"
              onClick={openConnectModal}
              type="button"
              variant="tertiary"
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
              alignItems="center"
              display="flex"
              onClick={openChainModal}
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
            <Button onClick={openAccountModal} variant="tertiary" {...rest}>
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
