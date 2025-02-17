'use client'

import { Button, Badge, Heading, Flex, Box, Center, Text, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { HookIcon } from '@repo/lib/shared/components/icons/HookIcon'

export function StableSurgePromoBanner() {
  return (
    <Box
      backgroundImage="url(/images/promos/stablesurge/stablesurge.jpg)"
      backgroundSize="cover"
      h="full"
      maxW="full"
      overflow="hidden"
      position="relative"
      rounded="lg"
      shadow="2xl"
      sx={{
        width: '100% !important',
        maxWidth: '100% !important',
      }}
      w="full"
    >
      <Center className="copy" h="full" zIndex="1">
        <Flex
          alignItems="space-between"
          borderRadius="xl"
          direction={{ base: 'column', md: 'row' }}
          gap="md"
          justifyContent="space-between"
          p={{ base: 'md', md: 'lg' }}
          w="full"
          zIndex="1"
        >
          <Box>
            <Stack direction={{ base: 'column', md: 'row' }} gap="md">
              <Badge
                alignItems="center"
                background="background.level0"
                backgroundImage="url(/images/promos/stablesurge/icon.png)"
                border="1px solid"
                borderColor="border.base"
                color="font.light"
                display="flex"
                fontSize="xs"
                fontWeight="normal"
                h={14}
                rounded="full"
                shadow="sm"
                w={14}
              >
                <Center h="full" w="full">
                  <HookIcon size={45} />
                </Center>
              </Badge>
              <Box>
                <Box>
                  <Heading
                    color="#fff"
                    fontSize={{ base: '20px', md: '22px', lg: '24px' }}
                    fontWeight="bold"
                    letterSpacing="-0.7px"
                    lineHeight="1"
                    pb="sm"
                  >
                    StableSurge Hook
                  </Heading>
                </Box>
                <Box>
                  <Text
                    color="#fff"
                    fontSize={{ base: 'md' }}
                    fontWeight="medium"
                    lineHeight="1.25"
                    maxW="600px"
                    opacity="0.8"
                  >
                    Applies a dynamic directional surge swap fee in times of volatility to help
                    defend the peg. LPs get MEV protection and increased fees.
                  </Text>
                </Box>
              </Box>
            </Stack>
          </Box>
          <Button
            as={NextLink}
            bg="#fff"
            color="black"
            cursor="hand"
            h={{ base: '32px', sm: '40px', lg: '48px' }}
            href="https://medium.com/balancer-protocol/balancers-stablesurge-hook-09d2eb20f219"
            maxW="120px"
            py="sm"
            rounded="full"
            shadow="2xl"
            size="md"
            variant="outline"
            w="120px"
          >
            Learn more
          </Button>
        </Flex>
      </Center>
    </Box>
  )
}
