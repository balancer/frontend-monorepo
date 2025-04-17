import { SimpleGrid, Flex, Box, Heading, Stack, Text, Center, useColorMode } from '@chakra-ui/react'
import { StarIcon } from '@chakra-ui/icons' // Placeholder icons
import { Picture } from '@repo/lib/shared/components/other/Picture'

export function WhyVeBalSection() {
  const { colorMode } = useColorMode()
  const benefits = [
    {
      icon: <StarIcon />, // Placeholder
      title: "Vote on Balancer's future",
      description:
        'veBAL holders govern the direction of the protocol including liquidity incentives.',
    },
    {
      icon: <StarIcon />, // Placeholder
      title: 'Share protocol revenue',
      description:
        'veBAL holders earn a share of protocol revenue in proportion to their holdings.',
    },
    {
      icon: <StarIcon />, // Placeholder
      title: 'Earn weekly voting incentives',
      description:
        "veBAL holders can earn lucrative 'bribes' from 3rd parties for voting for their pools.",
    },
    {
      icon: <StarIcon />, // Placeholder
      title: 'Boost liquidity mining yield',
      description:
        'Liquidity Providers with veBAL can get up to a 2.5x boost on BAL liquidity incentives.',
    },
  ]

  return (
    <Stack
      alignItems="center"
      gap="md"
      margin="0 auto"
      maxWidth="container.lg"
      px="md"
      width="full"
    >
      <Heading as="h2" pb="0" size="lg" textAlign="center" variant="special">
        Why get veBAL?
      </Heading>
      <Text color="font.secondary" maxWidth="38ch" pt="0" textAlign="center">
        Turn your BAL tokens into voting power and rewards.
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} mt="lg" spacing={{ base: 'ms', md: 'md', lg: 'lg' }}>
        {benefits.map(benefit => (
          <Flex
            _after={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bg: 'background.level2',
              zIndex: 1,
            }}
            alignItems="center"
            backgroundImage="url('/dark-marble-swirls.png')"
            backgroundPosition="center"
            backgroundSize="cover"
            borderRadius="lg"
            key={benefit.title}
            overflow="hidden"
            p={{ base: 'ms', md: 'md', lg: 'lg' }}
            position="relative"
            shadow="2xl"
          >
            <Flex alignItems="center" direction="row" gap={4} position="relative" zIndex={2}>
              <Flex
                alignItems="center"
                borderRadius="full"
                flexShrink={0}
                h="60px"
                justifyContent="center"
                w="60px"
              >
                <Box h={16} rounded="full" shadow="2xl" w={16}>
                  <Box h={16} rounded="full" shadow="md" w={16}>
                    <Box
                      alignItems="center"
                      color={colorMode === 'dark' ? 'font.light' : 'brown.300'}
                      display="flex"
                      fontSize="xs"
                      fontWeight="normal"
                      h={16}
                      overflow="hidden"
                      rounded="full"
                      shadow="innerRockShadow"
                      w={16}
                    >
                      <Box
                        h={16}
                        overflow="hidden"
                        position="absolute"
                        rounded="full"
                        w={16}
                        zIndex="-1"
                      >
                        <Picture
                          altText="Rock texture"
                          defaultImgType="jpg"
                          directory="/images/homepage/"
                          height={16}
                          imgAvif
                          imgAvifDark
                          imgJpg
                          imgJpgDark
                          imgName="stone"
                          width={16}
                        />
                      </Box>
                      <Center h="full" w="full">
                        {benefit.icon}
                      </Center>
                    </Box>
                  </Box>
                </Box>
              </Flex>
              <Box>
                <Heading as="h3" fontSize="xl" mb={2} sx={{ textWrap: 'balance' }}>
                  {benefit.title}
                </Heading>
                <Text color="font.secondary" fontSize="md" sx={{ textWrap: 'balance' }}>
                  {benefit.description}
                </Text>
              </Box>
            </Flex>
          </Flex>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
