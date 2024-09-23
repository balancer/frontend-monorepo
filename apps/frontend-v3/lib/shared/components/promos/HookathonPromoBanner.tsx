'use client'

import { Picture } from '@/lib/shared/components/other/Picture'
import { Button, Heading, Flex, Box, Center } from '@chakra-ui/react'
import NextLink from 'next/link'
import { ArrowUpRight } from 'react-feather'

export function HookathonPromoBanner() {
  return (
    <Box
      position="relative"
      height="140px"
      background={`url('/images/promos/hookathon/hookathon-bg.jpg') no-repeat left center`}
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
    >
      <Center h="100%" className="copy" zIndex="1">
        <Flex
          gap={{ base: 'ms', lg: 'md' }}
          direction={{ base: 'column', sm: 'row' }}
          justifyContent="center"
          alignItems="center"
          zIndex="1"
          borderRadius="xl"
        >
          <Flex
            gap={{ base: 'sm', lg: 'md' }}
            alignItems="center"
            direction={{ base: 'row', sm: 'row' }}
          >
            <Box w={{ base: '260px', lg: '324px' }} h="auto" position="relative" top="-2px">
              <Picture
                imgName="hookathon-logo"
                altText="Balancer Hookathon"
                defaultImgType="svg"
                imgSvg={true}
                directory="/images/promos/hookathon/"
              />
            </Box>
            <Box px="xs" display={{ base: 'none', md: 'block' }}>
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
            size="lg"
            as={NextLink}
            href="https://medium.com/balancer-protocol/balancer-v3-hookathon-bd3b8015de55"
            flex="1"
            rounded="full"
            py="sm"
            w="max-content"
            h={{ base: '32px', sm: '40px', lg: '48px' }}
            bg="font.dark"
            color="font.light"
            cursor="hand"
            _hover={{ bg: '#000', color: '#fff' }}
            shadow="2xl"
          >
            Learn more
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
