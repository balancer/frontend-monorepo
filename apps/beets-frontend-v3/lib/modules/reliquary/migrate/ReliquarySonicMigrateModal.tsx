import { Modal, ModalBody, ModalCloseButton, ModalContent } from '@chakra-ui/modal';
import {
    Button,
    ButtonProps,
    Heading,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
    Box,
    Text,
    Divider,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { FadeInBox } from '~/components/animation/FadeInBox';
import { ReliquaryWithdrawTypeChoice } from '~/modules/reliquary/withdraw/components/ReliquaryWithdrawTypeChoice';
import { useReliquaryWithdrawState } from '~/modules/reliquary/withdraw/lib/useReliquaryWithdrawState';
import useReliquary from '../lib/useReliquary';
import { ReliquarySonicMigrateBridgeBeets } from './components/ReliquarySonicMigrateBridgeBeets';
import { ReliquarySonicMigrateNextSteps } from './components/ReliquarySonicMigrateNextSteps';
import { ReliquarySonicMigrateBridgeFtm } from './components/ReliquarySonicMigrateBridgeFtm';
import { ReliquarySonicMigrateUnwrapFtm } from './components/ReliquarySonicMigrateUnwrapFtm';
import { ReliquarySonicMigrateExitRelics } from './components/ReliquarySonicMigrateExitRelics';
import { CurrentStepProvider } from '../lib/useReliquaryCurrentStep';
import { ReliquarySonicMigrateStakeS } from './components/ReliquarySonicMigrateStakeS';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}
export function ReliquarySonicMigrateModal({ isOpen, onClose }: Props) {
    const initialRef = useRef(null);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl" initialFocusRef={initialRef}>
            <ModalOverlay />
            <ModalContent backgroundColor="black">
                <ModalCloseButton />
                <ModalHeader className="bg">
                    <Heading size="md" noOfLines={1}>
                        Migrate your maBEETS to Sonic
                    </Heading>
                </ModalHeader>
                <ModalBody className="bg" p="0">
                    <FadeInBox isVisible={true}>
                        <Box pb="6">
                            <Text px="6">
                                Migrating your maBEETS from Fantom to Sonic unlocks access to the upgraded Beets
                                ecosystem on Sonic. Follow the steps below carefully and enjoy the transition to Sonic!
                            </Text>
                            <Divider borderColor="whiteAlpha.600" mb="6" mt="6" />
                            <CurrentStepProvider>
                                <Box px="6">
                                    <ReliquarySonicMigrateExitRelics />
                                </Box>
                            </CurrentStepProvider>
                            <Divider borderColor="whiteAlpha.600" mb="6" mt="6" />
                            <Box px="6">
                                <ReliquarySonicMigrateBridgeBeets />
                            </Box>
                            <Divider borderColor="whiteAlpha.600" mb="6" mt="6" />
                            <Box px="6">
                                <ReliquarySonicMigrateUnwrapFtm />
                            </Box>
                            <Divider borderColor="whiteAlpha.600" mb="6" mt="6" />
                            <Box px="6">
                                <ReliquarySonicMigrateBridgeFtm />
                            </Box>
                            <Divider borderColor="whiteAlpha.600" mb="6" mt="2" />
                            <Box px="6">
                                <ReliquarySonicMigrateStakeS />
                            </Box>
                            <Divider borderColor="whiteAlpha.600" mb="6" mt="2" />
                            <Box px="6">
                                <ReliquarySonicMigrateNextSteps />
                            </Box>
                        </Box>
                    </FadeInBox>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
