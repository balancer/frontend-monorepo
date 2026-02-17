'use client'

import {
  VStack,
  Button,
  Text,
  GridItem,
  Grid,
  Box,
  Center,
  Link,
  Stack,
  IconButton,
  Heading,
  useColorMode,
} from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { ArrowUpRight } from 'react-feather'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import { SpearbitLogo } from '@repo/lib/shared/components/imgs/SpearbitLogo'
import { TrailOfBitsLogo } from '@repo/lib/shared/components/imgs/TrailOfBitsLogo'
import { CertoraLogo } from '@repo/lib/shared/components/imgs/CertoraLogo'
import { WordsPullUp } from '@repo/lib/shared/components/animations/WordsPullUp'
import { BlurIn } from '@repo/lib/shared/components/animations/BlurIn'
import { motion } from 'framer-motion'
import { ReactNode, useState, useMemo, memo } from 'react'

const MotionBox = motion(Box)

const HOVER_ANIMATION = {
  scale: 1.0,
  transition: { duration: 0.3 },
}

const ARROW_ICON = <ArrowUpRight size="14px" />

const CENTER_HOVER_STYLES = { transform: 'scale(1.12)', color: 'font.maxContrast' }
const ICON_BUTTON_HOVER_STYLES = { opacity: 1 }

const GRADIENT_OVERLAYS = {
  light: [
    {
      background: 'linear-gradient(90deg, #eee 0%, #999 100%)',
      blendMode: 'soft-light',
    },
    {
      background: 'linear-gradient(90deg, #666 0%, #eee 100%)',
      blendMode: 'soft-light',
    },
    {
      background: 'linear-gradient(90deg, #eee 0%, #bbb 100%)',
      blendMode: 'soft-light',
    },
  ],
  dark: [
    {
      background:
        'linear-gradient(90deg, #B3AEF5 54.87%, #D7CBE7 70.41%, #E5C8C8 82.72%, #EAA879 96.28%)',
      blendMode: 'overlay',
    },
    {
      background: 'linear-gradient(90deg, rgba(237, 187, 250, 0.00) 0.08%, #F48975 90%)',
      blendMode: 'soft-light',
    },
    {
      background: 'linear-gradient(90deg, #62E9CA 0%, #42DCFD 98.03%)',
      blendMode: 'soft-light',
    },
  ],
} as const

const AuditCard = memo(function AuditCard({
  href,
  logo,
  bgImageName,
  colorMode,
  gradientIndex,
}: {
  href: string
  logo: ReactNode
  bgImageName: string
  colorMode: 'light' | 'dark'
  gradientIndex: number
}) {
  const [isHovered, setIsHovered] = useState(false)

  const gradientOverlay = useMemo(
    () => GRADIENT_OVERLAYS[colorMode][gradientIndex],
    [colorMode, gradientIndex]
  )

  return (
    <Link cursor="pointer" href={href} isExternal>
      <MotionBox
        _hover={{ shadow: 'sm' }}
        data-group
        minH="180px"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        overflow="hidden"
        position="relative"
        role="group"
        rounded="lg"
        shadow="2xl"
        whileHover={HOVER_ANIMATION}
      >
        {/* Background with rock texture and gradient overlay */}
        <Box
          h="full"
          left="0"
          overflow="hidden"
          pointerEvents="none"
          position="absolute"
          top="0"
          w="full"
          zIndex="0"
        >
          <Picture
            altText="Background texture"
            defaultImgType="png"
            directory="/images/textures/rocks/slate-portrait/"
            height="100%"
            imgAvif
            imgAvifDark
            imgJpg
            imgJpgDark
            imgName={`slate${bgImageName}`}
            width="100%"
          />
          {/* Flash overlay on initial hover */}
          <Box
            bg="white"
            h="full"
            left="0"
            opacity={0}
            position="absolute"
            sx={{
              animation: isHovered ? 'flash 0.3s ease-out' : 'none',
              '@keyframes flash': {
                '0%': { opacity: 0.15 },
                '100%': { opacity: 0 },
              },
            }}
            top="0"
            w="full"
            zIndex="1"
          />
          {/* Gradient overlay with blend mode shown on hover */}
          <Box
            background={gradientOverlay?.background}
            h="full"
            left="0"
            opacity={isHovered ? 1 : 0}
            position="absolute"
            sx={{
              mixBlendMode: gradientOverlay?.blendMode,
            }}
            top="0"
            transition="opacity 0.5s var(--ease-out-cubic) 0.05s"
            w="full"
            zIndex="3"
          />
        </Box>
        <Center
          _groupHover={CENTER_HOVER_STYLES}
          _hover={{ shadow: 'innerRockShadow' }}
          color="font.primary"
          h="full"
          left="0"
          position="absolute"
          shadow="innerRockShadowSm"
          top="0"
          transition="transform 1s var(--ease-out-cubic), color 1s var(--ease-out-cubic)"
          w="full"
          zIndex="1"
        >
          {logo}
        </Center>
        <IconButton
          _groupHover={ICON_BUTTON_HOVER_STYLES}
          aria-label="View report"
          h="40px"
          icon={ARROW_ICON}
          isRound
          opacity={0}
          position="absolute"
          right="md"
          shadow="2xl"
          top="md"
          transition="opacity 0.3s ease"
          w="40px"
          zIndex="2"
        />
      </MotionBox>
    </Link>
  )
})

export function Audits() {
  const { colorMode } = useColorMode()

  const spearbitLogo = useMemo(() => <SpearbitLogo />, [])
  const trailOfBitsLogo = useMemo(() => <TrailOfBitsLogo />, [])
  const certoraLogo = useMemo(() => <CertoraLogo />, [])

  return (
    <Noise backgroundColor="background.level0WithOpacity ">
      <DefaultPageContainer noVerticalPadding py={['3xl', '10rem']}>
        <VStack align="start" spacing="lg" w="full">
          <Stack
            align="end"
            alignItems={{ base: 'start', lg: 'end' }}
            direction={{ base: 'column', lg: 'row' }}
            justify="space-between"
            spacing="lg"
            w="full"
          >
            <VStack align="start" spacing="lg">
              <BlurIn delay={0.4}>
                <Text
                  background="font.special"
                  backgroundClip="text"
                  fontSize="sm"
                  variant="eyebrow"
                >
                  SAFTEY & SECURITY
                </Text>
              </BlurIn>
              <WordsPullUp
                as="h2"
                color="font.primary"
                fontSize="4xl"
                fontWeight="bold"
                letterSpacing="-0.04rem"
                lineHeight={1}
                text="Audited by the best"
              />
            </VStack>
            <Button
              as={Link}
              href="https://github.com/balancer/balancer-v3-monorepo/tree/main/audits"
              isExternal
              rightIcon={ARROW_ICON}
              variant="secondary"
            >
              View reports
            </Button>
          </Stack>
          <Grid
            gap="md"
            templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(3, 1fr)' }}
            w="full"
          >
            <GridItem>
              <AuditCard
                bgImageName="0"
                colorMode={colorMode}
                gradientIndex={0}
                href="https://github.com/balancer/balancer-v3-monorepo/tree/main/audits/spearbit"
                logo={spearbitLogo}
              />
            </GridItem>
            <GridItem>
              <AuditCard
                bgImageName="1"
                colorMode={colorMode}
                gradientIndex={1}
                href="https://github.com/balancer/balancer-v3-monorepo/tree/main/audits/trail-of-bits"
                logo={trailOfBitsLogo}
              />
            </GridItem>
            <GridItem>
              <AuditCard
                bgImageName="2"
                colorMode={colorMode}
                gradientIndex={2}
                href="https://github.com/balancer/balancer-v3-monorepo/tree/main/audits/certora"
                logo={certoraLogo}
              />
            </GridItem>
          </Grid>
          <VStack align="start" mt="xs" spacing="xs">
            <Heading fontSize="lg" pb="xs" variant="h6">
              Review the code and report vulnerabilities
            </Heading>
            <Text color="font.secondary">
              Up to $1m is up for grabs in the bug bounty on{' '}
              <Link
                alignItems="center"
                display="inline-flex"
                gap="2px"
                href="https://immunefi.com/bug-bounty/balancer/information/"
                isExternal
              >
                Immunefi
                {ARROW_ICON}
              </Link>
            </Text>
          </VStack>
        </VStack>
      </DefaultPageContainer>
    </Noise>
  )
}
