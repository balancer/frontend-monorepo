// import { Hero } from './v1/Hero'
import { Build } from './v2/Build'
import { Hero as HeroV2 } from './v2/Hero'
import { Code } from './v2/Code'
import { Videos } from './v2/Videos'
import { Audits } from './v2/Audits'
import { Grants } from './v2/Grants'
import { Grow } from './v2/Grow'
import { Box, BoxProps, HStack, VStack } from '@chakra-ui/react'

function Line({
  length,
  thickness = '20px',
  direction = 'horizontal',
}: {
  length: number
  thickness?: string
  direction?: 'horizontal' | 'vertical'
}) {
  return (
    <Box
      boxShadow="0px -3px 15px 1px rgba(255, 255, 255, 0.08), inset 0px 3px 15px 1px rgba(0, 0, 0, 0.15), 0px 3px 15px 1px rgba(0, 0, 0, 0.15), inset 0px -3px 15px 1px rgba(255, 255, 255, 0.08)"
      h={direction === 'horizontal' ? thickness : `${length}px`}
      w={direction === 'vertical' ? thickness : `${length}px`}
    />
  )
}

function Arc({ ...rest }: BoxProps) {
  return (
    <Box h="100px" position="relative" w="100px" {...rest}>
      <Box inset={0} overflow="hidden" position="absolute">
        <Box
          boxShadow="-3px -3px 15px 1px rgba(255, 255, 255, 0.08), inset 3px 3px 15px 1px rgba(0, 0, 0, 0.15), 3px 3px 15px 1px rgba(0, 0, 0, 0.15), inset -3px -3px 15px 1px rgba(255, 255, 255, 0.08)"
          h="200px"
          left="-100px"
          position="absolute"
          rounded="full"
          top="0"
          w="200px"
        />
      </Box>
    </Box>
  )
}

export function LandingV3() {
  return (
    <>
      <HeroV2 />
      {/* <Box minH="100vh" mt="100px">
        <HStack alignItems="start" spacing="none">
          <VStack alignItems="start" spacing="none">
            <Line length={500} />
            <Line length={500} />
            <Line length={500} />
            <Line length={500} />
            <Line length={500} />
            <Line length={500} />
            <Line length={500} />
            <Line length={500} />
            <Line length={500} />
            <Line length={500} />
            <Line length={500} />
            <Line length={500} />
          </VStack>
          <VStack alignItems="start" spacing="none">
            <Arc />
          </VStack>
        </HStack>
      </Box> */}
      <Code />
      <Build />
      <Videos />
      <Audits />
      <Grants />
      <Grow />
    </>
  )
}
