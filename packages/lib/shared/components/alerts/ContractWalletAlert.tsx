import { HStack, Text, Link, VStack, UnorderedList, ListItem } from '@chakra-ui/react'
import { BalAlert } from './BalAlert'
import { BalAlertContent } from './BalAlertContent'
import { ArrowUpRight } from 'react-feather'
import { useSafeAppLink } from '@repo/lib/modules/web3/safe.hooks'

export function ContractWalletAlert() {
  const safeAppLink = useSafeAppLink()

  return (
    <BalAlert
      content={
        <BalAlertContent forceColumnMode title={'Are you using a smart contract wallet?'}>
          <Text color="black" lineHeight="shorter">
            We couldn't detect your wallet type. For the popular smart contract wallets listed
            below, view the tips for help.
          </Text>
          <VStack pt="3">
            <UnorderedList w="full">
              <WalletLink href={safeAppLink} name={'Safe{wallet}'} />
              <WalletLink href="https://console.fireblocks.io/v2/web3" name="Fireblocks" />
              <WalletLink href="https://app-v2.augustdigital.io/" name="August Digital" />
              <WalletLink href="https://dashboard.porto.xyz/" name="Porto by Anchorage Digital" />
            </UnorderedList>
          </VStack>
        </BalAlertContent>
      }
      status="info"
    />
  )
}

function WalletLink({ href, name }: { href: string; name: string }) {
  return (
    <ListItem color="black">
      <Link href={href} isExternal>
        <HStack gap="xs">
          <Text color="black">{name}</Text>
          <ArrowUpRight size="12" />
        </HStack>
      </Link>
    </ListItem>
  )
}
