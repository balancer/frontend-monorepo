'use client'

import React from 'react'
import { Button, Heading, Flex, Box, Center } from '@chakra-ui/react'
import NextLink from 'next/link'
import { ArrowUpRight } from 'react-feather'

export function CowGalxeQuestPromoBanner() {
  return (
    <Box
      background={`url('/images/promos/cow-galxe-quest/bg.jpeg') no-repeat center center`}
      backgroundSize="cover"
      boxShadow="lg"
      h={{ base: '200px', sm: '140px' }}
      height="140px"
      maxW="100%"
      overflow="hidden"
      position="relative"
      rounded="lg"
      sx={{
        width: '100% !important',
        maxWidth: '100% !important',
      }}
      width="full"
    >
      <Center className="copy" h="100%" zIndex="1">
        <Flex
          alignItems="center"
          borderRadius="xl"
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: 'ms', lg: 'md' }}
          justifyContent="center"
          zIndex="1"
        >
          <Flex
            alignItems="center"
            direction={{ base: 'column', sm: 'row' }}
            gap={{ base: 'sm', sm: '0' }}
          >
            <Box>
              <Heading
                color="#fff"
                fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                fontWeight="regular"
                lineHeight="1"
              >
                The Arbitrum Arc:
              </Heading>
            </Box>
            <Box pl="sm" textAlign="center">
              <Heading
                color="font.light"
                fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                fontWeight="regular"
                lineHeight="1"
              >
                Moove into CoW AMM!
              </Heading>
            </Box>
          </Flex>
          <Button
            _hover={{ bg: '#fff', color: '#000' }}
            as={NextLink}
            bg="font.light"
            color="font.dark"
            cursor="hand"
            flex="1"
            h={{ base: '32px', sm: '40px', lg: '48px' }}
            href="https://app.galxe.com/quest/Balancer/GC863txfST"
            py="sm"
            rounded="full"
            shadow="2xl"
            size="lg"
            w="max-content"
          >
            Join the quest
            <Box
              _groupHover={{ transform: ' translateX(1.5px)' }}
              pl="xs"
              transition="all 0.2s var(--ease-out-cubic)"
            >
              <ArrowUpRight size={14} style={{ display: 'inline' }} />
            </Box>
          </Button>
        </Flex>
      </Center>
    </Box>
  )
}
