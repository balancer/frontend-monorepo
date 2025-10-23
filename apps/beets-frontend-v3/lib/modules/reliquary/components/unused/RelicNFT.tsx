import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { Box, Image } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { getProvider } from '@wagmi/core';
import useReliquary from '~/modules/reliquary/lib/useReliquary';
import { useQuery } from 'react-query';

export function RelicNFT() {
    const controls = useAnimation();
    const [imageURI, setImageURI] = useState('');
    const { reliquaryService, selectedRelicId, isLoadingRelicPositions } = useReliquary();

    const startAnimation = async () => {
        await controls.start({
            transform: 'scale(1)',
            opacity: 1,
            transition: { type: 'spring', mass: 0.5, damping: 10 },
        });
    };

    const nft = useQuery(
        ['relicNFT', { selectedRelicId, isLoadingRelicPositions }],
        async () => {
            if (selectedRelicId) {
                return await reliquaryService.getRelicNFT({ tokenId: selectedRelicId, provider: getProvider() });
            }
        },
        {
            onSuccess: (imageURI) => {
                setImageURI(imageURI);
            },
        },
    );

    useEffect(() => {
        setTimeout(() => {
            startAnimation();
        }, 500);
    }, []);

    return (
        <Box initial={{ transform: 'scale(0)', opacity: 0 }} animate={controls} as={motion.div} className="relic-glow">
            <Box rounded="lg" overflow="hidden">
                {imageURI && <Image alt="Relic NFT" src={imageURI} width="400px" height="400px" />}
            </Box>
        </Box>
    );
}
