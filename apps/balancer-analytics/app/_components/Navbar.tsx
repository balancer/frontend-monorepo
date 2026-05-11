import { Box, Container, HStack, Heading, Text } from '@chakra-ui/react'
import Image from 'next/image'
import Link from 'next/link'

// NOTE: don't use DefaultPageContainer here — it pads the top by
// `var(--navbar-height, 72px)` to leave room *for* a navbar.
export function Navbar() {
  return (
    <Box
      as="nav"
      bg="background.level0"
      borderBottom="1px solid"
      borderColor="border.subduedZen"
      position="sticky"
      top={0}
      w="full"
      zIndex={10}
    >
      <Container maxW="maxContent" px={['ms', 'md']} py="sm">
        <HStack justify="space-between" w="full">
          <Link
            aria-label="DeFilytica homepage"
            href="https://defilytica.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            <HStack spacing="sm">
              <Image
                alt="DeFilytica"
                height={28}
                priority
                src="/images/defilytica.png"
                width={28}
              />
              <Heading
                fontSize="md"
                fontWeight="bold"
                letterSpacing="-0.2px"
                size="h6"
              >
                DeFilytica
              </Heading>
            </HStack>
          </Link>
          <Text color="font.secondary" fontSize="xs">
            Balancer Analytics
          </Text>
        </HStack>
      </Container>
    </Box>
  )
}
