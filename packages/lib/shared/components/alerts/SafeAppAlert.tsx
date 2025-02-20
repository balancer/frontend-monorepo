import { HStack } from '@chakra-ui/react'
import { BalAlert } from './BalAlert'
import { BalAlertButtonLink } from './BalAlertButtonLink'
import { BalAlertContent } from './BalAlertContent'
import { useWalletConnectMetadata } from '@repo/lib/modules/web3/wallet-connect/useWalletConnectMetadata'
import { useBreakpoints } from '../../hooks/useBreakpoints'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function SafeAppAlert() {
  const { isMobile } = useBreakpoints()
  const { isSafeAccountViaWalletConnect } = useWalletConnectMetadata()

  const {
    options: { isOnSafeAppList },
  } = PROJECT_CONFIG

  const content = isOnSafeAppList
    ? {
        description: `For a better experience, use the ${PROJECT_CONFIG.projectName} Safe app with your Safe wallet.`,
        title: `Consider using the ${PROJECT_CONFIG.projectName} Safe web app`,
        href: `https://app.safe.global/share/safe-app?appUrl=https://${PROJECT_CONFIG.projectId}.fi/pools`,
        buttonLabel: 'Open app',
      }
    : {
        description: `For a better experience, add ${PROJECT_CONFIG.projectName} as a custom Safe app in your Safe wallet. Use 'https://${PROJECT_CONFIG.projectId}.fi/pools' as the Safe App url when adding the custom app.`,
        title: `Consider adding ${PROJECT_CONFIG.projectName} as a custom Safe web app`,
        href: 'https://app.safe.global',
        buttonLabel: 'Go to Safe App',
      }

  if (isSafeAccountViaWalletConnect && !isMobile) {
    return <BalAlert content={<Content content={content} />} status="info" />
  }
  return null
}

function Content({
  content,
}: {
  content: { description: string; title: string; href: string; buttonLabel: string }
}) {
  return (
    <HStack flexWrap={{ base: 'wrap', md: 'nowrap' }}>
      <BalAlertContent description={content.description} forceColumnMode title={content.title} />
      {/*
        It is not possible to link to custom pool pages within balancer.fi/pools as the Safe App will not recognize them as valid Safe Apps :(
      */}
      <BalAlertButtonLink href={content.href}>{content.buttonLabel}</BalAlertButtonLink>
    </HStack>
  )
}
