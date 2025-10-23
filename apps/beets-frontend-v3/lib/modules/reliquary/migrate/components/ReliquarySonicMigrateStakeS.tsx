import { Box, Heading, Text, Link, Flex } from '@chakra-ui/react';
import { ExternalLink } from 'react-feather';

export function ReliquarySonicMigrateStakeS() {
    return (
        <Box>
            <Heading size="md">5. Stake S for stS</Heading>
            <Text mb="2">Stake your S to receive stS, Sonic's liquid staking token.</Text>
            <Link href="https://beets.fi/stake" target="_blank" mr="1">
                <Flex alignItems="center">
                    <Text mr="1">https://beets.fi/stake</Text>
                    <ExternalLink size={16} />
                </Flex>
            </Link>
        </Box>
    );
}
