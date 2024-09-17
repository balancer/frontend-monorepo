/* eslint-disable max-len */
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  ModalFooter,
  Box,
  Button,
  HStack,
  VStack,
  Link,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { ArrowUpRight } from 'react-feather'
import { Picture } from '../other/Picture'

export enum RedirectPartner {
  Aura = 'aura',
  Beets = 'beets',
  CoW = 'cow',
  Aave = 'aave',
  Gyro = 'gyro',
  Xave = 'xave',
  Cron = 'cron',
  Fjord = 'fjord',
}

type Props = {
  partner: RedirectPartner
  redirectUrl?: string
  isOpen: boolean
  onClose: () => void
}

type PartnerInfo = {
  [key in RedirectPartner]: {
    shortName: string
    fullName: string
    category: string
    description: string
    url: string
    imageName?: string
  }
}

const partnerInfo: PartnerInfo = {
  [RedirectPartner.Aura]: {
    shortName: 'Aura',
    fullName: 'Aura Finance',
    category: 'DeFi yield booster',
    description:
      "Aura Finance is a protocol built on top of the Balancer protocol to provide maximum incentives to Balancer liquidity providers and BAL stakers (into veBAL) through social aggregation of BAL deposits and via additional incentives of Aura's native token.",
    url: 'https://app.aura.finance',
    imageName: 'aura',
  },
  [RedirectPartner.Beets]: {
    shortName: 'Beets',
    fullName: 'Beethoven X',
    category: 'AMM / DEX',
    description:
      'Beethoven X is a community-driven DEX and DeFi power house. Governed by the BEETS token and living on the Fantom Opera and Optimism chains.',
    url: 'https://beets.fi',
    imageName: 'beets',
  },
  [RedirectPartner.CoW]: {
    shortName: 'CoW',
    fullName: 'CoW Protocol',
    category: 'DEX aggregator',
    description:
      'CoW Protocol matches trades by executing batch auctions between a variety of on-chain liquidity sources. Trades can be settled with on-chain AMMs directly or with DEX aggregators, depending on which path offers the best price. It is thus, essentially, an aggregator of the DEX aggregators. \n\nIn addition to finding the best prices at any point in time, CoW Protocol can improve prices over what is available elsewhere in the market -- firstly by finding Coincidences of Wants between traders, and secondly by protecting users from having their slippage exploited by MEV bots.',
    url: 'https://cow.fi',
    imageName: 'cow',
  },
  [RedirectPartner.Aave]: {
    shortName: 'Aave',
    fullName: 'Aave',
    category: 'Lend & borrow protocol',
    description:
      'Aave is a decentralized non-custodial liquidity protocol where users can participate as depositors or borrowers. Depositors provide liquidity to the market to earn a passive income, while borrowers are able to borrow in an overcollateralized (perpetually) or undercollateralized (one-block liquidity) fashion.',
    url: 'https://aave.com',
    imageName: 'aave',
  },
  [RedirectPartner.Gyro]: {
    shortName: 'Gyroscope',
    fullName: 'Stablecoin protocol',
    category: 'Stablecoin protocol',
    description:
      'Gyroscope is a new stablecoin that, like a physical gyroscope, remains stable as the surrounding environment changes. It is a revolution in stablecoin architecture, risk control and AMM design. Gyroscope is fully-backed, automates monetary policy, and features new AMMs designed for resilient liquidity.',
    url: 'https://gyro.finance',
    imageName: 'gyro',
  },
  [RedirectPartner.Xave]: {
    shortName: 'Xave',
    fullName: 'Xave',
    category: 'FX Market Infrastructure',
    description:
      'Xave Finance (pronounced “Save Finance”) builds the on chain infrastructure to enable financial services companies (such as fintechs and neobanks) to leverage DeFi for actual use cases, such as real time remittance transfers and high yield consumer savings.\n\nXave aims to eventually disrupt existing FX services available for overseas money transfers by enabling instant stablecoin trades at FX accurate rates for traders and extremely competitive returns for LPs.',
    url: 'https://www.xave.co/',
    imageName: 'xave',
  },
  [RedirectPartner.Cron]: {
    shortName: 'Cron',
    fullName: 'Cron Finance',
    category: 'TWAMM for large swaps',
    description:
      'Cron Finance is currently building a Time-Weighted Average Market Maker (TWAMM). The goal of TWAMM functionality is to execute large trades over a period of time in a way that reduces slippage and gas cost for the party executing a swap.',
    url: 'https://app.cronfi.com',
    imageName: 'cron',
  },
  [RedirectPartner.Fjord]: {
    shortName: 'Fjord Foundry',
    fullName: 'Fjord Foundry',
    category: 'Fair token launch LBPs',
    description:
      "Fjord (Formerly known as Copper Launch) is a community platform that connects inspired projects with passionate supporters utilizing the power of Liquidity Bootstrapping Pools (LBPs). Fair launch your token and build your community in minutes via Fjord's user friendly platform.",
    url: 'https://fjordfoundry.com',
    imageName: 'fjord',
  },
}

export function PartnerRedirectModal({ partner, redirectUrl, isOpen, onClose }: Props) {
  const info = partnerInfo[partner]

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered preserveScrollBarGap>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>About {info.shortName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody color="grayText">
          {info.imageName && (
            <Box mb={4} shadow="md" borderRadius="lg" w="full" overflow="hidden">
              <Picture
                imgName={info.imageName}
                altText={info.shortName}
                width="400"
                height="156"
                defaultImgType="jpg"
                directory="/images/partners/headers/"
                imgAvif={true}
                imgJpg={true}
              />
            </Box>
          )}
          <VStack align="start" w="full" spacing="md">
            <VStack align="start" w="full" spacing="none">
              <Text fontWeight="bold" fontSize="md">
                {info.category}
              </Text>
              <Link fontSize="sm" color="font.secondary" href={info.url} isExternal>
                {info.url}
              </Link>
            </VStack>

            <Text whiteSpace="pre-line">{info.description}</Text>
            <Text color="font.secondary" fontSize="sm">
              Please note, you face additional risks (including smart contract risk) when
              interacting with third party services.
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter pb="lg">
          <Button
            as={NextLink}
            href={redirectUrl ?? info.url}
            target="_blank"
            variant="primary"
            w="full"
          >
            <HStack>
              <span>Go to {info.shortName}</span>
              <ArrowUpRight size={16} />
            </HStack>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
