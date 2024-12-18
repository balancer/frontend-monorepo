'use client'

import React from 'react'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import { Button, Heading, Flex, Box, Center, useColorModeValue } from '@chakra-ui/react'
import NextLink from 'next/link'

export function BeetsPromoBanner() {
  const bgColor = useColorModeValue('#194D05', '#194D05')

  return (
    <Box
      //background={bgColor}
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
      {/* <Box zIndex="0">
        <Box left="0" position="absolute" top="0">
          <Picture
            altText="Cow marks"
            defaultImgType="svg"
            directory="/images/partners/"
            imgName="cowmarks-left"
            imgSvg
            imgSvgPortrait
          />
        </Box>
      </Box> */}

      <Box zIndex="0">
        <Box left="0" position="absolute" top="0" zIndex="0">
          <Picture
            altText="Cow marks"
            defaultImgType="svg"
            directory="/images/misc/"
            imgName="pools-banner"
            imgPng
            width="100%"
          />
        </Box>
      </Box>

      {/* <Center className="copy" h="100%" zIndex="1">
        <Flex
          alignItems="center"
          borderRadius="xl"
          direction={{ base: 'column', sm: 'row' }}
          gap={{ base: 'sm', md: 'md' }}
          justifyContent="center"
          pr="4px"
          zIndex="1"
        >
          <Flex
            alignItems="center"
            direction={{ base: 'row', sm: 'row' }}
            gap={{ base: 'ms', md: 'md' }}
          >
            <Box h="auto" w="clamp(54px, 10vw, 78px)">
              <Picture
                altText="CoW AMM logo"
                defaultImgType="svg"
                directory="/images/partners/"
                imgName="cowamm-logo"
                imgSvg
              />
            </Box>
            <Box bg="#194D05" borderRadius="xl" px="xs">
              <Heading color="#BCEC79" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold">
                CoW AMM is live
              </Heading>
            </Box>
          </Flex>
          <Button
            _hover={{ bg: '#E2F8BF' }}
            as={NextLink}
            bg="#BCEC79"
            color="#194D05"
            flex="1"
            h={{ base: '32px', sm: '40px', md: '48px' }}
            href="/pools/cow"
            prefetch
            py="sm"
            rounded="full"
            size="lg"
            w="max-content"
          >
            View pools
          </Button>
        </Flex>
      </Center> */}
    </Box>
  )
}
