import { HStack } from '@chakra-ui/react'
import { BalAlert } from './BalAlert'
import { BalAlertButtonLink } from './BalAlertButtonLink'
import { BalAlertContent } from './BalAlertContent'
import { useWalletConnectMetadata } from '@/lib/modules/web3/useWalletConnectMetadata'
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
        title="Consider using the Balancer Safe web app"
        description="For a better experience, use the Balancer Safe app with your Safe wallet."
        forceColumnMode
      ></BalAlertContent>
      <BalAlertButtonLink href="https://app.safe.global/share/safe-app?appUrl=https://balancer.fi/pools">
        Open app
      </BalAlertButtonLink>
    </HStack>
  )
}
