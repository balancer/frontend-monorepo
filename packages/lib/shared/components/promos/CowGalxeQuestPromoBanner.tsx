'use client'

import React from 'react'
import { Button, Heading, Flex, Box, Center } from '@chakra-ui/react'
import NextLink from 'next/link'
import { ArrowUpRight } from 'react-feather'

export function CowGalxeQuestPromoBanner() {
  return (
    <Box
      position="relative"
      height="140px"
      background={`url('/images/promos/cow-galxe-quest/bg.jpeg') no-repeat center center`}
      backgroundSize="cover"
      width="full"
      maxW="100%"
      rounded="lg"
      overflow="hidden"
      sx={{
        width: '100% !important',
        maxWidth: '100% !important',
      }}
      boxShadow="lg"
      h={{ base: '200px', sm: '140px' }}
    >
      <Center h="100%" className="copy" zIndex="1">
        <Flex
          gap={{ base: 'ms', lg: 'md' }}
          direction={{ base: 'column', md: 'row' }}
          justifyContent="center"
          alignItems="center"
          zIndex="1"
          borderRadius="xl"
        >
          <Flex
            gap={{ base: 'sm', sm: '0' }}
            alignItems="center"
            direction={{ base: 'column', sm: 'row' }}
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
            size="lg"
            as={NextLink}
            href="https://app.galxe.com/quest/Balancer/GC863txfST"
            flex="1"
            rounded="full"
            py="sm"
            w="max-content"
            h={{ base: '32px', sm: '40px', lg: '48px' }}
            bg="font.light"
            color="font.dark"
            cursor="hand"
            _hover={{ bg: '#fff', color: '#000' }}
            shadow="2xl"
          >
            Join the quest
            <Box
              pl="xs"
              transition="all 0.2s var(--ease-out-cubic)"
              _groupHover={{ transform: ' translateX(1.5px)' }}
            >
              <ArrowUpRight size={14} style={{ display: 'inline' }} />
            </Box>
          </Button>
        </Flex>
      </Center>
    </Box>
  )
}
