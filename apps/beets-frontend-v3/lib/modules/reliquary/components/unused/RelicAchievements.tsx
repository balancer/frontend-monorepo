import { Box, HStack, Text, VStack } from '@chakra-ui/layout';
import { motion } from 'framer-motion';
import React from 'react';
import Card from '~/components/card/Card';

interface Props {}

const TEMP_ACHIEVMENTS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function RelicAchievements({}: Props) {
    return (
        <Card p="4" width={{ base: 'full', lg: "50%" }} height='full'>
            <VStack spacing="4">
                <HStack width="full" spacing="12" alignItems="flex-start">
                    <VStack spacing="0" alignItems="flex-start">
                        <Text lineHeight="1rem" fontWeight="semibold" fontSize="md" color="beets.base.50">
                            Achievements
                        </Text>
                    </VStack>
                </HStack>
                <Box width="full">
                    {TEMP_ACHIEVMENTS.map((achievement, i) => (
                        <Box
                            float="left"
                            mr="2"
                            mb="2"
                            width="100px"
                            height="100px"
                            rounded="md"
                            backgroundColor="whiteAlpha.200"
                            initial={{ opacity: 0, transform: 'scale(0)' }}
                            animate={{ opacity: 1, transform: 'scale(1)', transition: { delay: i * 0.1 } }}
                            as={motion.div}
                            key={`relic-achievement-${achievement}`}
                        ></Box>
                    ))}
                </Box>
            </VStack>
        </Card>
    );
}
