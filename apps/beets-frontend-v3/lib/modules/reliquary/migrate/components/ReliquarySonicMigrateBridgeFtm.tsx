import { Box, Heading, Text, Link, Flex } from '@chakra-ui/react';
import { ExternalLink } from 'react-feather';

export function ReliquarySonicMigrateBridgeFtm() {
    return (
        <Box>
            <Heading size="md">4. Upgrade your FTM to S</Heading>
            <Text mb="2">Use the Sonic native bridge to upgrade your FTM to S:</Text>
            <Link href="https://my.soniclabs.com/upgrade" target="_blank" mr="1">
                <Flex alignItems="center">
                    <Text mr="1">https://my.soniclabs.com/upgrade</Text>
                    <ExternalLink size={16} />
                </Flex>
            </Link>
        </Box>
    );
}
