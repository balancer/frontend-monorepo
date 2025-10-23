import { Box, Flex, Heading, Link, Text } from '@chakra-ui/react'
import { ExternalLink } from 'react-feather'
import { FBeetsTokenSonic } from '../assets/FBeetsTokenSonic'

export default function ReliquaryHeroBanner() {
  return (
    <Flex
      alignItems={{ base: 'flex-start', md: 'center' }}
      backgroundImage="url('/images/ma-beets-banner.png')"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      borderRadius="10px"
      boxShadow="0px 0px 0px 1px #00000005,1px 1px 1px -0.5px #0000000F,3px 3px 3px -1.5px #0000000F,6px 6px 6px -3px #0000000F,12px 12px 12px -6px #0000000F,24px 24px 24px -12px #0000001A,-0.5px -1px 0px 0px #FFFFFF26"
      flexDirection={{ base: 'column', md: 'row' }}
      gap={{ base: '4', md: '0' }}
      justifyContent={{ base: 'flex-start', md: 'center' }}
      minHeight="200px"
      overflow="hidden"
      px={{ base: '4', md: '0' }}
      py={{ base: '4', md: '0' }}
    >
      <Flex alignItems={{ base: 'flex-start', md: 'center' }} pl={{ base: '0', md: '8' }}>
        <Flex
          alignItems={{ base: 'flex-start', md: 'center' }}
          flexDirection="column"
          justifyContent="center"
        >
          <Heading mb="2" size="lg" textAlign={{ base: 'left', md: 'center' }}>
            maBEETS
          </Heading>
          <Text color="white" fontSize="md" textAlign={{ base: 'left', md: 'center' }}>
            Maturity adjusted voting power,
            <br />
            voting incentives and $BEETS rewards
          </Text>
        </Flex>
      </Flex>
      <Flex
        alignItems={{ base: 'flex-start', md: 'center' }}
        flex="1"
        flexDirection="column"
        justifyContent="center"
        ml={{ base: '4', md: '12' }}
      >
        <Flex alignItems={{ base: 'flex-start', md: 'center' }}>
          <Box>
            <ul style={{ textAlign: 'left' }}>
              <li>Participate in BEETS governance</li>
              <li>Unlock maturity adjusted rewards</li>
              <li>Access evolving Ludwig fNFTs</li>
            </ul>
            <Link href="https://docs.beets.fi/tokenomics/mabeets" target="_blank">
              <Flex alignItems="center" mt="2">
                <Box textAlign={{ base: 'left', md: 'center' }}>Learn more</Box>
                <Box ml="1">
                  <ExternalLink size={16} />
                </Box>
              </Flex>
            </Link>
          </Box>
          <Box display={{ base: 'none', md: 'block' }} ml="8">
            <FBeetsTokenSonic height="110px" width="110px" />
          </Box>
        </Flex>
      </Flex>
    </Flex>
  )
}
