import { Box, Heading, Text, Link, Flex } from '@chakra-ui/react';
import { ExternalLink } from 'react-feather';

export function ReliquarySonicMigrateNextSteps() {
    return (
        <Box>
            <Heading size="md">6. Next steps</Heading>
            <Text mb="2">Once you've completed the steps above, you can create your maBEETS relic on Sonic.</Text>
            <Link href="https://ma.beets.fi/" target="_blank" mr="1">
                <Flex alignItems="center">
                    <Text mr="1">https://ma.beets.fi/</Text>
                    <ExternalLink size={16} />
                </Flex>
            </Link>
        </Box>
    );
}
