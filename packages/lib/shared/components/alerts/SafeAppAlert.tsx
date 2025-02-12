import { HStack } from '@chakra-ui/react'
import { BalAlert } from './BalAlert'
import { BalAlertButtonLink } from './BalAlertButtonLink'
import { BalAlertContent } from './BalAlertContent'
import { useWalletConnectMetadata } from '@repo/lib/modules/web3/wallet-connect/useWalletConnectMetadata'
import { useBreakpoints } from '../../hooks/useBreakpoints'

export function SafeAppAlert() {
  const { isMobile } = useBreakpoints()
  const { isSafeAccountViaWalletConnect } = useWalletConnectMetadata()
  if (isSafeAccountViaWalletConnect && !isMobile) {
    return <BalAlert content={<Content />} status="info" />
  }
  return null
}

function Content() {
  return (
    <HStack flexWrap={{ base: 'wrap', md: 'nowrap' }}>
      <BalAlertContent
        description="For a better experience, use the Balancer Safe app with your Safe wallet."
        forceColumnMode
        title="Consider using the Balancer Safe web app"
      />
      {/*
        It is not possible to link to custom pool pages within balancer.fi/pools as the Safe App will not recognize them as valid Safe Apps :(
      */}
      <BalAlertButtonLink href="https://app.safe.global/share/safe-app?appUrl=https://balancer.fi/pools">
        Open app
      </BalAlertButtonLink>
    </HStack>
  )
}
