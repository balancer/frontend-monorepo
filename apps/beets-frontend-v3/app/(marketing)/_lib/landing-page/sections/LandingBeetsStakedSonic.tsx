'use client'

import React from 'react'
import { Box, Center, Flex, Heading, Text, VStack } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'

export function LandingBeetsStakedSonic() {
  return (
    <>
      <Center mb="2xl" textAlign="center">
        <VStack>
          <Heading fontSize="5xl">Beets Staked Sonic (stS)</Heading>
          <Text fontSize="2xl" fontWeight="thin" maxW="full" w="2xl">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit ligula a ultrices
            dapibus. Maecenas sit amet lectus tortor. Nam luctus eros leo.
          </Text>
        </VStack>
      </Center>
      <DefaultPageContainer noVerticalPadding pb="3xl">
        <Box bg="rgba(255, 255, 255, 0.05)" p="xl" w="full">
          <Flex>
            <Box flex="1" mr="2xl">
              <Box mb="2xl">
                <Heading fontSize="3xl">Stake and transact</Heading>
                <Text fontSize="lg" fontWeight="thin">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean scelerisque
                  vehicula diam vitae ultrices. Ut et elementum lorem. Sed et augue elit.
                  Pellentesque sed turpis odio. Sed lacinia maximus lacus mollis aliquam. Aenean a
                  sem lacus. In aliquam velit elit, eu semper mi euismod vitae.
                </Text>
              </Box>
              <Box>
                <Heading fontSize="3xl">Value appreciation with $S</Heading>
                <Text fontSize="lg" fontWeight="thin">
                  In molestie imperdiet nulla, vitae vestibulum lectus tempor ac. Donec dui purus,
                  pharetra id sem eget, dictum congue eros. Vestibulum dignissim nisi non dolor
                  maximus, ac vestibulum urna porttitor. Sed iaculis bibendum libero in commodo.
                  Nulla rhoncus risus nibh.
                </Text>
              </Box>
            </Box>
            <Box flex="1">
              <Flex mb="xl">
                <Box
                  width="170px"
                  height="170px"
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius="lg"
                />
                <Box flex="1" ml="xl">
                  <Heading fontSize="2xl">Sonic network staking rewards</Heading>
                  <Text fontSize="lg" fontWeight="thin">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit ligula a
                    ultrices dapibus. Maecenas sit amet lectus tortor. Nam luctus eros leo.
                  </Text>
                </Box>
              </Flex>
              <Flex mb="xl">
                <Box flex="1" mr="xl">
                  <Heading fontSize="2xl">Max DeFi interoperability</Heading>
                  <Text fontSize="lg" fontWeight="thin">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit ligula a
                    ultrices dapibus. Maecenas sit amet lectus tortor. Nam luctus eros leo.
                  </Text>
                </Box>
                <Box
                  width="170px"
                  height="170px"
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius="lg"
                />
              </Flex>
              <Flex>
                <Box
                  width="170px"
                  height="170px"
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius="lg"
                />
                <Box flex="1" ml="xl">
                  <Heading fontSize="2xl">Decentralization</Heading>
                  <Text fontSize="lg" fontWeight="thin">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit ligula a
                    ultrices dapibus. Maecenas sit amet lectus tortor. Nam luctus eros leo.
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Flex>
        </Box>
      </DefaultPageContainer>
    </>
  )
}
