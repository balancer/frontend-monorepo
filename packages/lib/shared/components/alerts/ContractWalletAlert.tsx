import { HStack, Text, Link } from '@chakra-ui/react'
import { BalAlert } from './BalAlert'
import { BalAlertContent } from './BalAlertContent'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { ArrowUpRight } from 'react-feather'

export function ContractWalletAlert() {
  return (
    <BalAlert
      content={
        <BalAlertContent
          description={
            <>
              <Text color="black" lineHeight="shorter">
                We couldn't detect your wallet type. For the popular smart contract wallets listed
                below, view the tips for help.
              </Text>
              <ul>
                <li>
                  <WalletLink
                    href={`https://app.safe.global/share/safe-app?appUrl=https://${PROJECT_CONFIG.projectId}.fi/pools`}
                    name={'Safe{wallet}'}
                  />
                </li>
                <li>
                  <WalletLink href="https://console.fireblocks.io/v2/web3" name="Fireblocks" />
                </li>
                <li>
                  <WalletLink href="https://app-v2.augustdigital.io/" name="August Digital" />
                </li>
                <li>
                  <WalletLink
                    href="https://dashboard.porto.xyz/"
                    name="Porto by Anchorage Digital"
                  />
                </li>
              </ul>
            </>
          }
          forceColumnMode
          title={'Are you using a smart contract wallet?'}
        />
      }
      status="info"
    />
  )
}

function WalletLink({ href, name }: { href: string; name: string }) {
  return (
    <HStack>
      <Link href={href} isExternal>
        <HStack gap="xs">
          <Text color="black">{name}</Text>
          <ArrowUpRight size="12" />
        </HStack>
      </Link>
    </HStack>
  )
}
