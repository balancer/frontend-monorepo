'use client'

import { Picture } from '@/lib/shared/components/other/Picture'
import { Button, Heading, Flex, Box, Center, useColorModeValue } from '@chakra-ui/react'
import NextLink from 'next/link'

export function CowPromoBanner() {
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
      boxShadow="lg"
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
        <Flex
          gap={{ base: 'sm', md: 'md' }}
          direction={{ base: 'column', sm: 'row' }}
          justifyContent="center"
          alignItems="center"
          pr="4px"
          zIndex="1"
          borderRadius="xl"
        >
          <Flex
            gap={{ base: 'ms', md: 'md' }}
            alignItems="center"
            direction={{ base: 'row', sm: 'row' }}
          >
            <Box w="clamp(54px, 10vw, 78px)" h="auto">
              <Picture
                imgName="cowamm-logo"
                altText="CoW AMM logo"
                defaultImgType="svg"
                imgSvg={true}
                directory="/images/partners/"
              />
            </Box>
            <Box px="xs" borderRadius="xl" bg="#194D05">
              <Heading color="#BCEC79" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold">
                CoW AMM is live
              </Heading>
            </Box>
          </Flex>
          <Button
            size="lg"
            as={NextLink}
            prefetch={true}
            href="/pools/cow"
            flex="1"
            rounded="full"
            py="sm"
            w="max-content"
            h={{ base: '32px', sm: '40px', md: '48px' }}
            bg="#BCEC79"
            color="#194D05"
            _hover={{ bg: '#E2F8BF' }}
          >
            View pools
          </Button>
        </Flex>
      </Center>
    </Box>
  )
}
