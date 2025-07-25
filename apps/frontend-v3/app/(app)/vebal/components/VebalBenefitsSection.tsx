import { SimpleGrid, Flex, Box, Heading, Stack, Text } from '@chakra-ui/react'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import { VebalBenefitsVoteIcon } from '@repo/lib/shared/components/icons/vebal/VebalBenefitsVoteIcon'
import { VebalBenefitsShareIcon } from '@repo/lib/shared/components/icons/vebal/VebalBenefitsShareIcon'
import { VebalBenefitsBribesIcon } from '@repo/lib/shared/components/icons/vebal/VebalBenefitsBribesIcon'
import { VebalBenefitsSparklesIcon } from '@repo/lib/shared/components/icons/vebal/VebalBenefitsSparklesIcon'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { SparkleIconWrapper } from '@repo/lib/shared/components/animations/SparkleIconWrapper'
import { StoneIcon } from '@repo/lib/shared/components/StoneIcon'

export function VebalBenefitsSection() {
  const benefits = [
    {
      icon: (
        <SparkleIconWrapper size={47}>
          <VebalBenefitsVoteIcon />
        </SparkleIconWrapper>
      ),
      title: "Vote on Balancer's future",
      description:
        'veBAL holders govern the direction of the protocol including liquidity incentives.',
    },
    {
      icon: (
        <SparkleIconWrapper size={45}>
          <VebalBenefitsShareIcon />
        </SparkleIconWrapper>
      ),
      title: 'Share protocol revenue',
      description:
        'veBAL holders earn a share of protocol revenue in proportion to their holdings.',
      transformBackground: 'rotate(90deg)',
    },
    {
      icon: (
        <SparkleIconWrapper size={45}>
          <VebalBenefitsBribesIcon />
        </SparkleIconWrapper>
      ),
      title: 'Earn weekly voting incentives',
      description:
        "veBAL holders can earn lucrative 'bribes' from 3rd parties for voting for their pools.",
      transformBackground: 'rotate(180deg)',
    },
    {
      icon: (
        <SparkleIconWrapper size={41}>
          <VebalBenefitsSparklesIcon />
        </SparkleIconWrapper>
      ),
      title: 'Boost liquidity mining yield',
      description:
        'Liquidity Providers with veBAL can get up to a 2.5x boost on BAL liquidity incentives.',
      transformBackground: 'rotate(-90deg)',
    },
  ]

  return (
    <Stack
      alignItems="center"
      gap="md"
      margin="0 auto"
      maxWidth="container.xl"
      pt={{ base: '60px', md: '40' }}
      px={{ base: 'md', '2xl': '0' }}
      width="full"
    >
      <FadeInOnView animateOnce={false}>
        <Stack
          alignItems="center"
          gap="md"
          margin="0 auto"
          maxWidth="container.lg"
          px="md"
          width="full"
        >
          <Heading as="h2" bg="background.gold" bgClip="text" pb="0.5" size="lg" textAlign="center">
            Why get veBAL?
          </Heading>
          <Text
            color="font.secondary"
            lineHeight="1.4"
            maxWidth="38ch"
            pt="0"
            sx={{ textWrap: 'pretty' }}
            textAlign="center"
          >
            Turn your BAL tokens into voting power and rewards.
          </Text>
        </Stack>
      </FadeInOnView>
      <SimpleGrid
        alignItems="stretch"
        columns={{ base: 1, md: 2 }}
        mt="lg"
        spacing={{ base: 'ms', md: 'md', lg: 'lg' }}
      >
        {benefits.map(benefit => (
          <FadeInOnView animateOnce={false} key={benefit.title}>
            <Flex
              borderRadius="xl"
              flex="1"
              flexDirection="column"
              height="100%"
              justifyContent="center"
              overflow="hidden"
              p={{ base: 'ms', sm: 'md', md: 'xl' }}
              position="relative"
              shadow="2xl"
            >
              <Box bottom="0" left="0" position="absolute" right="0" top="0">
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
              <Flex
                alignItems="center"
                direction="row"
                gap={{ base: 'ms', sm: 'md', lg: 'lg' }}
                position="relative"
                zIndex={2}
              >
                <Flex
                  alignItems="center"
                  borderRadius="full"
                  flexShrink={0}
                  justifyContent="center"
                >
                  <StoneIcon
                    icon={benefit.icon}
                    sparkleSize={41}
                    transformBackground={benefit.transformBackground}
                  />
                </Flex>
                <Box>
                  <Heading
                    as="h3"
                    bg="background.gold"
                    bgClip="text"
                    fontSize={{ base: 'lg', md: 'xl' }}
                    mb={{ base: 'xxs', md: '2' }}
                    pb="0.5"
                    sx={{ textWrap: 'balance' }}
                  >
                    {benefit.title}
                  </Heading>
                  <Text
                    color="font.secondary"
                    fontSize={{ base: 'sm', md: 'md' }}
                    lineHeight="1.4"
                    pb="0.5"
                    sx={{ textWrap: 'balance' }}
                  >
                    {benefit.description}
                  </Text>
                </Box>
              </Flex>
            </Flex>
          </FadeInOnView>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
