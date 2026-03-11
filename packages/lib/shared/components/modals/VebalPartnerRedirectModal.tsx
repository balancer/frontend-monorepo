import { Text, Box, Button, HStack, VStack, Link, Dialog, Portal } from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'
import { Picture } from '../other/Picture'

export enum VebalRedirectPartner {
  Aura = 'aura',
  StakeDAO = 'stake',
  Palladin = 'palladin',
}

type Props = {
  partner: VebalRedirectPartner
  redirectUrl?: string
  open: boolean
  onClose: () => void
}

type PartnerInfo = {
  [key in VebalRedirectPartner]: {
    shortName: string
    fullName: string
    category: string
    description: string
    url: string
    imageName?: string
  }
}

const partnerInfo: PartnerInfo = {
  [VebalRedirectPartner.Aura]: {
    shortName: 'Aura',
    fullName: 'Aura Finance',
    category: 'DeFi yield booster',
    description:
      "Aura Finance is a protocol built on top of the Balancer protocol to provide maximum incentives to Balancer liquidity providers and BAL stakers (into veBAL) through social aggregation of BAL deposits and via additional incentives of Aura's native token.",
    url: 'https://app.aura.finance',
    imageName: 'aura',
  },
  [VebalRedirectPartner.StakeDAO]: {
    shortName: 'Votemarket',
    fullName: 'Votemarket',
    category: 'DeFi liquid locker',
    description:
      "Votemarket is a key participant in veBAL through its 'Liquid Locker' product for BAL tokens. Votemarket enables users and DAOs to lock BAL in the 80BAL/20WETH Balancer pool, minting sdBAL—a liquid wrapper that provides the benefits of veBAL for LPs (voting power, boosted rewards, and protocol fees) without sacrificing liquidity.",
    url: 'https://www.stakedao.org/lockers/bal',
    imageName: 'stakedao',
  },

  [VebalRedirectPartner.Palladin]: {
    shortName: 'Paladin',
    fullName: 'Paladin',
    category: 'veBAL voting incentives',
    description:
      "Paladin is a marketplace for voting incentives, commonly referred to as 'bribes' in DeFi. Paladin allows third party protocols to offer additional weekly incentives for veBAL holders who vote for certain eligible Pool Gauges.",
    url: 'https://palladin.io',
    imageName: 'paladin',
  },
}

export function VebalPartnerRedirectModal({ partner, redirectUrl, open, onClose }: Props) {
  const info = partnerInfo[partner]

  return (
    <Dialog.Root
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) {
          onClose()
        }
      }}
      open={open}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>About {info.shortName}</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body color="grayText">
              {info.imageName && (
                <Box borderRadius="lg" mb={4} overflow="hidden" shadow="md" w="full">
                  <Picture
                    altText={info.shortName}
                    defaultImgType="jpg"
                    directory="/images/partners/headers/"
                    height="156"
                    imgAvif
                    imgJpg
                    imgName={info.imageName}
                    width="400"
                  />
                </Box>
              )}
              <VStack align="start" gap="md" w="full">
                <VStack align="start" gap="none" w="full">
                  <Text fontSize="sm" fontWeight="bold">
                    {info.category}
                  </Text>
                  <Link
                    color="font.secondary"
                    fontSize="sm"
                    href={info.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {info.url}
                  </Link>
                </VStack>

                <Text whiteSpace="pre-line">{info.description}</Text>
                <Text color="font.secondary" fontSize="sm">
                  Please note, you face additional risks (including smart contract risk) when
                  interacting with third party services.
                </Text>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer pb="lg">
              <Button asChild variant="primary" w="full">
                <Link href={redirectUrl ?? info.url} rel="noopener noreferrer" target="_blank">
                  <HStack>
                    <span>Go to {info.shortName}</span>
                    <ArrowUpRight size={16} />
                  </HStack>
                </Link>
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
