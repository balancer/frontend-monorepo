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
      minH="65px"
      minW={{ base: '100px', sm: '132px' }}
      position="relative"
      rounded="md"
      shadow="md"
      width={{ base: '100%', md: '100%' }}
    >
      <Box height="100%" pointerEvents="none" position="absolute" width="100%">
        <Box
          _groupHover={{
            transform: 'scale(1.01)',
          }}
          backgroundPosition="left"
          backgroundSize="cover"
          height="100%"
          pointerEvents="none"
          position="absolute"
          transform="scale(1)"
          transition="transform 0.5s var(--ease-out-cubic)"
          width="100%"
          zIndex="-1"
        >
          <Picture
            altText="Relic Stat bg"
            defaultImgType="jpg"
            directory="/images/homepage/"
            height="100%"
            imgAvif
            imgAvifDark
            imgJpg
            imgName="stone"
            width="100%"
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
    cursor="default"
    fontSize="xs"
    mb="1.5"
    position="relative"
    variant="secondary"
    w="fit-content"
  >
    {label}
  </Text>
)

export const StatValueText = ({ children }: { children: React.ReactNode }) => (
  <Text className="home-stats" fontSize="md" fontWeight="bold" letterSpacing="-0.6px">
    {children}
  </Text>
)
