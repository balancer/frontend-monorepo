import { Box, Text } from '@chakra-ui/react'
import Section from '@repo/lib/shared/components/layout/Section'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

export function V3VideoTutorial() {
  return (
    <Section className="tutorial">
      <FadeInOnView>
        <Box
          pt={{ base: 'lg', md: '2xl' }}
          px={{ base: 'md', xl: '0' }}
          w="full"
          maxW="4xl"
          m="auto"
          textAlign={{ base: 'left', md: 'center' }}
        >
          <Text fontWeight="bold" fontSize="lg" pb="md">
            Tutorial: Building a custom AMM on Balancer v3
          </Text>
          <Box mb="md" position="relative" paddingTop="56.25%" width="100%">
            <iframe
              className="youtube"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
              src="https://www.youtube.com/embed/oJAXQCMVdfA?si=lbZgEgKtWeNOdWR-"
              title="YouTube video player"
              frameBorder="0"
              // eslint-disable-next-line max-len
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
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
