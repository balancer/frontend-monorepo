import { Box, Text } from '@chakra-ui/react'
import Section from '@repo/lib/shared/components/layout/Section'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

export function V3VideoTutorial() {
  return (
    <Section className="tutorial">
      <FadeInOnView>
        <Box
          m="auto"
          maxW="4xl"
          pt={{ base: 'lg', md: '2xl' }}
          px={{ base: 'md', xl: '0' }}
          textAlign={{ base: 'left', md: 'center' }}
          w="full"
        >
          <Text fontSize="lg" fontWeight="bold" pb="md">
            Tutorial: Building a custom AMM on Balancer v3
          </Text>
          <Box mb="md" paddingTop="56.25%" position="relative" width="100%">
            <iframe
              // eslint-disable-next-line max-len
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="youtube"
              frameBorder="0"
              referrerPolicy="strict-origin-when-cross-origin"
              src="https://www.youtube.com/embed/oJAXQCMVdfA?si=lbZgEgKtWeNOdWR-"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
              title="YouTube video player"
            />
          </Box>
          <Text
            color="font.secondary"
            sx={{
              textWrap: 'balance',
            }}
          >
            Develop a liquidity pool contract and get set up on Scaffold Balancer—the new
            streamlined developer prototyping tool for creating custom AMMs on Balancer v3.
          </Text>
        </Box>
      </FadeInOnView>
    </Section>
  )
}
