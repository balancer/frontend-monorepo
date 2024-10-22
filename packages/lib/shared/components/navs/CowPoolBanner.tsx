'use client'

import { Picture } from '@repo/lib/shared/components/other/Picture'
import { Button, Flex, Box, Center, useColorModeValue } from '@chakra-ui/react'
import NextLink from 'next/link'
import { ArrowUpRight } from 'react-feather'

export function CowPoolBanner() {
  const bgColor = useColorModeValue('#194D05', '#194D05')

  return (
    <Box
      background={bgColor}
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
      <Box zIndex="0">
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
      </Box>

      <Box zIndex="0">
        <Box bottom="0" position="absolute" right="0" zIndex="0">
          <Picture
            altText="Cow marks"
            defaultImgType="svg"
            directory="/images/partners/"
            imgName="cowmarks-right"
            imgSvg
            imgSvgPortrait
          />
        </Box>
      </Box>

      <Center className="copy" h="100%" zIndex="1">
        <Flex alignItems="center" gap={{ base: 'ms', md: 'xl' }} justifyContent="center" zIndex="1">
          <Box h="auto" w="clamp(160px, 40vw, 300px)">
            <Picture
              altText="CoW AMM logo"
              defaultImgType="svg"
              directory="/images/partners/"
              imgName="cowamm-logotype"
              imgSvg
            />
          </Box>
          <Button
            _hover={{ bg: '#E2F8BF' }}
            as={NextLink}
            bg="#BCEC79"
            color="#194D05"
            flex="1"
            h={{ base: '32px', sm: '40px', md: '48px' }}
            href="https://cow.fi/cow-amm"
            rel="noopener noreferrer"
            role="group"
            rounded="full"
            size="lg"
            target="_blank"
            w="max-content"
          >
            How it works
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
