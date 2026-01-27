import { Box, Text } from '@chakra-ui/react'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import React, { ReactNode } from 'react'

interface StatProps {
  children?: ReactNode
}

function Stat({ children }: StatProps) {
  return (
    <Box
      display="flex"
      flex="1"
      h="full"
      minH="60px"
      minW={{ base: '100px', sm: '132px' }}
      position="relative"
      rounded="md"
      shadow="md"
      w="full"
    >
      <Box h="full" pointerEvents="none" position="absolute" w="full">
        <Box
          _groupHover={{
            transform: 'scale(1.01)',
          }}
          backgroundPosition="left"
          backgroundSize="cover"
          h="full"
          pointerEvents="none"
          position="absolute"
          transform="scale(1)"
          transition="transform 0.5s var(--ease-out-cubic)"
          w="full"
          zIndex="-1"
        >
          <Picture
            altText="Relic Stat bg"
            defaultImgType="jpg"
            directory="/images/homepage/"
            height="full"
            imgAvif
            imgAvifDark
            imgJpg
            imgName="stone"
            width="full"
          />
        </Box>
      </Box>
      <Box
        alignSelf="stretch"
        display="flex"
        flex="1"
        flexDirection="column"
        justifyContent="flex-start"
        p="2"
      >
        {children}
      </Box>
    </Box>
  )
}

export default Stat

export const StatLabel = ({ label }: { label: string }) => (
  <Text
    color="font.highlight"
    cursor="default"
    fontSize="sm"
    h="full"
    variant="primary"
    w="fit-content"
  >
    {label}
  </Text>
)

export const StatValueText = ({ children }: { children: React.ReactNode }) => (
  <Text className="home-stats" fontSize="md" fontWeight="bold" h="full" letterSpacing="-0.6px">
    {children}
  </Text>
)
