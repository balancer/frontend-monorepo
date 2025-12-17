'use client'

import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  HStack,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'
import NextLink from 'next/link'
import { BalancerIconCircular } from '@repo/lib/shared/components/icons/logos/BalancerIconCircular'
import { CowIconCircular } from '@repo/lib/shared/components/icons/logos/CowIconCircular'

const CREATE_POOL_LINKS = [
  {
    label: 'Balancer',
    href: '/create',
    icon: <BalancerIconCircular size={24} />,
    isExternal: false,
  },
  {
    label: 'CoW AMM',
    href: 'https://pool-creator.balancer.fi/cow',
    icon: <CowIconCircular size={24} />,
    isExternal: true,
  },
]

const RESOURCE_LINKS = [
  {
    label: 'v3 Scaffold',
    href: 'https://github.com/balancer/scaffold-balancer-v3',
  },
  {
    label: 'Code & Contracts',
    href: 'https://github.com/balancer',
  },
  {
    label: 'Documentation',
    href: 'https://docs.balancer.fi/',
  },
]

type MobileBuildAccordionProps = {
  onClose?: () => void
}

export function MobileBuildAccordion({ onClose }: MobileBuildAccordionProps) {
  return (
    <Accordion allowToggle w="full">
      <AccordionItem border="none">
        <AccordionButton _hover={{ bg: 'transparent' }} pt="sm" px="0">
          <Text flex="1" fontSize="xl" fontWeight="medium" textAlign="left">
            Build
          </Text>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb="md" px="0">
          <VStack align="start" spacing="md">
            {/* Create a pool section */}
            <VStack align="start" spacing="sm" w="full">
              <Text color="grayText" fontSize="sm" fontWeight="bold">
                Create a pool
              </Text>
              {CREATE_POOL_LINKS.map(link => (
                <Link
                  _hover={{ color: 'font.highlight', textDecoration: 'none' }}
                  as={link.isExternal ? undefined : NextLink}
                  href={link.href}
                  isExternal={link.isExternal}
                  key={link.label}
                  onClick={onClose}
                  pb="0.5"
                  role="group"
                  w="full"
                >
                  <HStack spacing="sm">
                    {link.icon}
                    <Text
                      _groupHover={{ color: 'font.highlight' }}
                      alignItems="center"
                      display="flex"
                      fontSize="md"
                      fontWeight="bold"
                      gap="xs"
                    >
                      {link.label}
                      {link.isExternal && (
                        <Box as="span" color="grayText">
                          <ArrowUpRight size={12} />
                        </Box>
                      )}
                    </Text>
                  </HStack>
                </Link>
              ))}
            </VStack>

            {/* Builder resources section */}
            <VStack align="start" spacing="sm" w="full">
              <Text color="grayText" fontSize="sm" fontWeight="bold">
                Builder resources
              </Text>
              {RESOURCE_LINKS.map(link => (
                <Link
                  _hover={{ color: 'font.highlight', textDecoration: 'none' }}
                  alignItems="center"
                  color="font.primary"
                  display="flex"
                  fontSize="xs"
                  gap="xxs"
                  href={link.href}
                  isExternal
                  key={link.label}
                  onClick={onClose}
                >
                  {link.label}
                  <Box color="grayText">
                    <ArrowUpRight size={12} />
                  </Box>
                </Link>
              ))}
            </VStack>
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
