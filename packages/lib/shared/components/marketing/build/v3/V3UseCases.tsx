/* eslint-disable max-len */
import {
  Center,
  Heading,
  Text,
  Flex,
  Box,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import Section from '@repo/lib/shared/components/layout/Section'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { Picture } from '../../../other/Picture'
import { ArrowUpRight } from 'react-feather'
import NextLink from 'next/link'
import { useState } from 'react'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  useCase: UseCase
}

enum UseCase {
  BoostedPools = 'boosted-pools',
  Stablesurge = 'stablesurge',
  LVRMitigation = 'lvr-mitigation',
}

type UseCaseInfo = {
  [key in UseCase]: {
    title: string
    description: string
    url: string
  }
}

const useCaseInfo: UseCaseInfo = {
  [UseCase.BoostedPools]: {
    title: '100% Boosted Pools',
    description:
      'Balancer v3 introduces 100% Boosted Pools, enhancing capital efficiency for passive LPs. These pools deposit idle liquidity in trusted platforms like Aave, providing LPs exposure to an additional layer of sustainable yield. Unlike v2, v3 registers yield-bearing tokens directly with the pool, using Buffers to facilitate gas-efficient swaps. Buffers act as simple two-token liquidity pools that hold a yield bearing token (waUSDC) and it’s underlying counterpart (USDC), minimizing external calls and providing LPs with full yield exposure while optimizing gas usage.',
    url: 'https://docs-v3.balancer.fi/concepts/explore-available-balancer-pools/boosted-pool.html#advantages-of-boosted-pools',
  },
  [UseCase.Stablesurge]: {
    title: 'Custom Pools and Hooks',
    description:
      'Balancer v3 is a platform for AMM experimentation and innovation, allowing custom pools to iterate on existing or define entirely new swap invariants. With the v3 vault handling much of the responsibility that was previously delegated to the pool contract, internally developed pools are significantly less complex. By shifting core design patterns out of the pool and into the vault, v3 produces a 10x improvement in pool developer experience.\n\nAdditionally, v3 introduces a hooks framework that allows developers to easily extend existing pool types at various key points throughout the pool’s lifecycle, unlocking an infinite design space.',
    url: 'https://docs-v3.balancer.fi/concepts/core-concepts/hooks.html',
  },
  [UseCase.LVRMitigation]: {
    title: 'LVR / MEV Mitigation',
    description:
      'Balancer v3 focuses on minimizing MEV and maximizing LP profitability by collaborating with intent-centric projects like CowSwap. v3 leverages custom AMM logic and a hooks framework to enable third-party teams easily to develop MEV mitigation strategies. Supported by Balancer DAO, this approach aims to help bolster MEV innovation for LPs, enhancing fairness and profitability in on-chain interactions for the future to come.',
    url: 'https://docs-v3.balancer.fi/',
  },
}

function UseCaseModal({ useCase, isOpen, onClose }: ModalProps) {
  const info = useCaseInfo[useCase]

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered preserveScrollBarGap>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{info.title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody color="grayText">
          <Text whiteSpace="pre-wrap">{info.description}</Text>
        </ModalBody>

        <ModalFooter>
          <HStack w="full">
            <Button as={NextLink} href={info.url} target="_blank" variant="primary" w="full">
              <HStack>
                <span>View in v3 docs</span>
                <ArrowUpRight size={16} />
              </HStack>
            </Button>
            <Button variant="tertiary" w="full" onClick={onClose}>
              Close
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export function V3UseCases() {
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase>(UseCase.BoostedPools)

  const modalDisclosure = useDisclosure()

  function openModal(useCase: UseCase) {
    setSelectedUseCase(useCase)
    modalDisclosure.onOpen()
  }

  return (
    <Section className="use-cases">
      <Box maxW="maxContent" m="0 auto" px={{ base: 'md', xl: '0' }}>
        <Box
          pb={{ base: 'md', md: 'lg' }}
          w="full"
          maxW="6xl"
          m="auto"
          textAlign={{ base: 'left', md: 'center' }}
        >
          <FadeInOnView>
            <Text pb="lg" variant="eyebrow" w="full">
              Use cases
            </Text>
            <Heading
              pb="md"
              w="full"
              as="h2"
              size="2xl"
              sx={{
                textWrap: 'balance',
              }}
            >
              Flexible design space for AMMs
            </Heading>
            <Text
              pb="lg"
              maxW="4xl"
              m="auto"
              sx={{
                textWrap: 'balance',
              }}
            >
              v3 enables the next wave of DeFi products to come to market. Discover what can be
              built on Balancer v3.
            </Text>
          </FadeInOnView>
          <FadeInOnView>
            <Flex gap={{ base: 'md', md: 'lg', lg: 'xl' }} pt={{ base: '0', md: 'md' }}>
              <Box
                position="relative"
                rounded="full"
                cursor="pointer"
                onClick={() => openModal(UseCase.BoostedPools)}
              >
                <Center transition="transform 0.3s ease-out" _hover={{ transform: 'scale(1.1)' }}>
                  <Box className="enso" role="group">
                    <Picture
                      imgName="use-case-1"
                      altText="100% boosted pools"
                      defaultImgType="png"
                      directory="/images/v3/"
                      imgPngDark={true}
                      imgPng={true}
                    />
                  </Box>

                  <Box
                    textAlign="center"
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%,-50%)"
                    zIndex="10"
                    width="full"
                    padding="md"
                  >
                    <Box>
                      <Text
                        fontWeight="bold"
                        color="white"
                        position="relative"
                        top={{ base: '0', md: '0' }}
                        fontSize={{ base: 'md', lg: 'xl' }}
                      >
                        100% Boosted Pools
                      </Text>
                    </Box>
                  </Box>
                </Center>
              </Box>
              <Box
                position="relative"
                rounded="full"
                cursor="pointer"
                onClick={() => openModal(UseCase.Stablesurge)}
              >
                <Center transition="transform 0.3s ease-out" _hover={{ transform: 'scale(1.1)' }}>
                  <Box className="enso">
                    <Picture
                      imgName="use-case-2"
                      altText="100% boosted pools"
                      defaultImgType="png"
                      directory="/images/v3/"
                      imgPngDark={true}
                      imgPng={true}
                    />
                  </Box>

                  <Box
                    textAlign="center"
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%,-50%)"
                    zIndex="10"
                    width="full"
                    padding="md"
                  >
                    <Box>
                      <Text
                        fontWeight="bold"
                        color="white"
                        position="relative"
                        top={{ base: '0', md: '0' }}
                        fontSize={{ base: 'md', lg: 'xl' }}
                      >
                        Custom Pools and Hooks
                      </Text>
                    </Box>
                  </Box>
                </Center>
              </Box>

              <Box
                position="relative"
                rounded="full"
                cursor="pointer"
                onClick={() => openModal(UseCase.LVRMitigation)}
              >
                <Center transition="transform 0.3s ease-out" _hover={{ transform: 'scale(1.1)' }}>
                  <Box className="enso">
                    <Picture
                      imgName="use-case-3"
                      altText="100% boosted pools"
                      defaultImgType="png"
                      directory="/images/v3/"
                      imgPngDark={true}
                      imgPng={true}
                    />
                  </Box>

                  <Box
                    textAlign="center"
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%,-50%)"
                    zIndex="10"
                    width="full"
                    padding="md"
                  >
                    <Box>
                      <Text
                        fontWeight="bold"
                        color="white"
                        position="relative"
                        top={{ base: '0', md: '0' }}
                        fontSize={{ base: 'md', lg: 'xl' }}
                      >
                        LVR mitigation
                      </Text>
                    </Box>
                  </Box>
                </Center>
              </Box>
            </Flex>
          </FadeInOnView>
        </Box>
      </Box>
      <UseCaseModal
        isOpen={modalDisclosure.isOpen}
        onClose={modalDisclosure.onClose}
        useCase={selectedUseCase}
      />
    </Section>
  )
}
