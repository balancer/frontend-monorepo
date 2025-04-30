'use client'

import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { VotingDeadlineCalendar } from './VotingDeadlineCalendar'
import { VotingDeadlineCounter } from './VotingDeadlineCounter'
import { Picture } from '@repo/lib/shared/components/other/Picture'

export function VotingDeadline() {
  return (
    <VStack p={{ base: 'ms', lg: '20px' }} position="relative" spacing="16px" zIndex="1">
      <Box inset={0} overflow="hidden" position="absolute" rounded="lg" shadow="2xl">
        <Picture
          altText="Background texture"
          defaultImgType="png"
          directory="/images/textures/"
          height="100%"
          imgAvif
          imgAvifDark
          imgAvifPortrait
          imgAvifPortraitDark
          imgName="rock-slate"
          imgPng
          imgPngDark
          width="100%"
        />
      </Box>
      <Box bg="background.level0" inset={0} opacity={0.75} position="absolute" rounded="lg" />
      <Text
        alignSelf="start"
        color="font.secondary"
        fontSize="11px"
        opacity={0.8}
        variant="eyebrow"
      >
        Weekly voting deadline
      </Text>
      <HStack
        align="stretch"
        flexDirection={{ base: 'column', lg: 'row' }}
        spacing={{ base: 'ms', md: 'md', xl: '20px' }}
      >
        <Box display={{ base: 'none', md: 'flex' }}>
          <VotingDeadlineCalendar />
        </Box>
        <VotingDeadlineCounter />
      </HStack>
    </VStack>
  )
}
