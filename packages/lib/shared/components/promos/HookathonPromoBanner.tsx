'use client'

import { Picture } from '@repo/lib/shared/components/other/Picture'
import { Button, Heading, Flex, Box, Center } from '@chakra-ui/react'
import NextLink from 'next/link'
import { ArrowUpRight } from 'react-feather'

export function HookathonPromoBanner() {
  return (
    <Box
      background={`url('/images/promos/hookathon/hookathon-bg.jpg') no-repeat left center`}
      backgroundSize="cover"
      boxShadow="lg"
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
          direction={{ base: 'column', sm: 'row' }}
          gap={{ base: 'ms', lg: 'md' }}
          justifyContent="center"
          zIndex="1"
        >
          <Flex
            alignItems="center"
            direction={{ base: 'row', sm: 'row' }}
            gap={{ base: 'sm', lg: 'md' }}
          >
            <Box h="auto" position="relative" top="-2px" w={{ base: '260px', lg: '324px' }}>
              <Picture
                altText="Balancer Hookathon"
                defaultImgType="svg"
                directory="/images/promos/hookathon/"
                imgName="hookathon-logo"
                imgSvg
              />
            </Box>
            <Box display={{ base: 'none', md: 'block' }} px="xs">
              <Heading
                color="font.dark"
                fontSize={{ base: '3xl', lg: '4xl' }}
                fontWeight="regular"
                lineHeight="1"
              >
                Create.Collab.Contribute
              </Heading>
            </Box>
          </Flex>
          <Button
            _hover={{ bg: '#000', color: '#fff' }}
            as={NextLink}
            bg="font.dark"
            color="font.light"
            cursor="hand"
            flex="1"
            h={{ base: '32px', sm: '40px', lg: '48px' }}
            href="https://medium.com/balancer-protocol/balancer-v3-hookathon-bd3b8015de55"
            py="sm"
            rounded="full"
            shadow="2xl"
            size="lg"
            w="max-content"
          >
            Learn more
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
