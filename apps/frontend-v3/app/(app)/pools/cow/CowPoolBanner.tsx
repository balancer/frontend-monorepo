'use client'

import { Picture } from '@/lib/shared/components/other/Picture'
import { Button, Flex, Box, Center, useColorModeValue } from '@chakra-ui/react'
import NextLink from 'next/link'
import { ArrowUpRight } from 'react-feather'

export function CowPoolBanner() {
  const bgColor = useColorModeValue('#194D05', '#194D05')

  return (
    <Box
      position="relative"
      height="140px"
      background={bgColor}
      width="full"
      maxW="100%"
      rounded="lg"
      overflow="hidden"
      sx={{
        width: '100% !important',
        maxWidth: '100% !important',
      }}
    >
      <Box zIndex="0">
        <Box position="absolute" left="0" top="0">
          <Picture
            imgName="cowmarks-left"
            altText="Cow marks"
            defaultImgType="svg"
            imgSvg={true}
            imgSvgPortrait={true}
            directory="/images/partners/"
          />
        </Box>
      </Box>

      <Box zIndex="0">
        <Box position="absolute" right="0" bottom="0" zIndex="0">
          <Picture
            imgName="cowmarks-right"
            altText="Cow marks"
            defaultImgType="svg"
            imgSvg={true}
            imgSvgPortrait={true}
            directory="/images/partners/"
          />
        </Box>
      </Box>

      <Center h="100%" className="copy" zIndex="1">
        <Flex gap={{ base: 'ms', md: 'xl' }} justifyContent="center" alignItems="center" zIndex="1">
          <Box w="clamp(160px, 40vw, 300px)" h="auto">
            <Picture
              imgName="cowamm-logotype"
              altText="CoW AMM logo"
              defaultImgType="svg"
              imgSvg={true}
              directory="/images/partners/"
            />
          </Box>
          <Button
            size="lg"
            as={NextLink}
            href="https://cow.fi/cow-amm"
            flex="1"
            rounded="full"
            w="max-content"
            h={{ base: '32px', sm: '40px', md: '48px' }}
            bg="#BCEC79"
            color="#194D05"
            _hover={{ bg: '#E2F8BF' }}
            target="_blank"
            rel="noopener noreferrer"
            role="group"
          >
            How it works
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
