import { Modal, ModalCloseButton } from '@chakra-ui/modal';
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    ButtonProps,
    Heading,
    IconButton,
    ModalOverlay,
    useDisclosure,
    Text,
} from '@chakra-ui/react';
import { ChevronLeft } from 'react-feather';
import { ReliquaryInvestPreview } from '~/modules/reliquary/invest/components/ReliquaryInvestPreview';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, AnimatePresence, motion, useAnimation } from 'framer-motion';
import { BeetsModalBody, BeetsModalContent, BeetsModalHeader } from '~/components/modal/BeetsModal';
import { useReliquary } from '~/modules/reliquary/ReliquaryProvider';
import { ReliquaryInvestTypeChoice } from './components/ReliquaryInvestTypeChoice';
import { ReliquaryInvestCustom } from './components/ReliquaryInvestCustom';
import { ReliquaryInvestProportional } from './components/ReliquaryInvestProportional';
import { useReliquaryInvestState } from './lib/useReliquaryInvestState';
import { FadeInBox } from '~/components/animation/FadeInBox';

interface Props {
    createRelic?: boolean;
    activatorLabel?: string;
    activatorProps?: ButtonProps;
    noActivator?: boolean;
    isVisible?: boolean;
    onClose?: () => void;
    isConnected?: boolean;
}

function getInvertedTransform(startBounds: DOMRect, endBounds: DOMRect) {
    return {
        x: startBounds.x - endBounds.x,
        y: startBounds.y - endBounds.y,
        scaleX: startBounds.width / endBounds.width,
        scaleY: startBounds.height / endBounds.height,
    };
}

export function ReliquaryInvestModal({
    createRelic = false,
    activatorLabel,
    activatorProps = {},
    noActivator,
    onClose: _onClose,
    isVisible = false,
    isConnected = true,
}: Props) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [modalState, setModalState] = useState<'start' | 'proportional' | 'custom' | 'preview'>('start');
    const [type, setInvestType] = useState<'proportional' | 'custom' | null>(null);
    const initialRef = useRef(null);
    const [investComplete, setInvestComplete] = useState(false);
    const { selectedRelic, setCreateRelic } = useReliquary();
    const containerControls = useAnimation();
    const modalContainerRef = useRef<HTMLDivElement | null>(null);
    const lastModalBounds = useRef<DOMRect | null>(null);
    const { clearInvestState } = useReliquaryInvestState();

    function onModalOpen() {
        if (createRelic) {
            setCreateRelic(true);
        } else {
            setCreateRelic(false);
        }
        onOpen();
    }

    function onModalClose() {
        if (investComplete) {
            setInvestType(null);
            setCreateRelic(false);
        }
        setModalState('start');
        clearInvestState();
        onClose();
        _onClose && _onClose();
    }

    useEffect(() => {
        if (isVisible) {
            onModalOpen();
        } else {
            onModalClose();
        }
    }, [isVisible]);

    useLayoutEffect(() => {
        setTimeout(async () => {
            if (isOpen) {
                if (modalContainerRef.current) {
                    containerControls.set({
                        opacity: 0,
                        transform: 'scale(.75)',
                    });
                }
                await containerControls.start({
                    opacity: 1,
                    transform: 'scale(1)',
                });

                const bounds = modalContainerRef.current?.getBoundingClientRect();
                if (bounds) {
                    lastModalBounds.current = bounds;
                }
            } else {
                containerControls.start({
                    opacity: 0,
                    transform: 'scale(0.75)',
                });
            }
        }, 0);
    }, [isOpen]);

    useLayoutEffect(() => {
        if (modalContainerRef.current) {
            const bounds = modalContainerRef.current.getBoundingClientRect();
            if (lastModalBounds.current) {
                const invertedTransform = getInvertedTransform(lastModalBounds.current, bounds);
                animate(invertedTransform.scaleY, 1, {
                    onUpdate: (t) => {
                        if (modalContainerRef.current) {
                            modalContainerRef.current.style.transform = `scaleY(${t})`;
                        }
                    },
                });
            }
            lastModalBounds.current = bounds;
        }
    }, [modalState]);

    return (
        <Box width="full">
            {!noActivator && (
                <Button
                    variant="primary"
                    onClick={onModalOpen}
                    width="full"
                    disabled={!isConnected}
                    {...activatorProps}
                >
                    {activatorLabel || 'Get maBEETS'}
                </Button>
            )}
            <Modal motionPreset="none" isOpen={isOpen} onClose={onModalClose} size="lg" initialFocusRef={initialRef}>
                <ModalOverlay bg="blackAlpha.900" />
                <AnimatePresence exitBeforeEnter>
                    <BeetsModalContent position="relative" isTransparent={true}>
                        <Box
                            as={motion.div}
                            width="full"
                            height="full"
                            position="absolute"
                            top="0"
                            left="0"
                            right="0"
                            zIndex={-1}
                            animate={containerControls}
                            ref={modalContainerRef}
                            rounded="md"
                            transformOrigin="top"
                            background="gray.700"
                        >
                            <Box transformOrigin="top" width="full" height="full" background="blackAlpha.400">
                                <Box width="full" height="full" className="bg" />
                            </Box>
                        </Box>
                        <ModalCloseButton />
                        {modalState !== 'start' ? (
                            <IconButton
                                aria-label={'back-button'}
                                icon={<ChevronLeft />}
                                variant="ghost"
                                p="0"
                                width="32px"
                                height="32px"
                                minWidth="32px"
                                position="absolute"
                                top="12px"
                                left="12px"
                                onClick={() => {
                                    if (modalState === 'proportional' || modalState === 'custom') {
                                        setModalState('start');
                                    } else if (modalState === 'preview') {
                                        if (type === 'proportional') {
                                            setModalState('proportional');
                                        } else if (type === 'custom') {
                                            setModalState('custom');
                                        }
                                    }
                                }}
                            />
                        ) : null}
                        <BeetsModalHeader>
                            {modalState === 'start' ? (
                                <>
                                    <Heading size="md" noOfLines={1}>
                                        Invest into {createRelic ? 'a new  ' : 'an existing '}relic
                                    </Heading>
                                    <Text fontSize="1rem" fontWeight="normal">
                                        Deposit into the fresh BEETS pool to get maBEETS.
                                    </Text>
                                </>
                            ) : null}
                            {modalState === 'proportional' ? (
                                <Heading size="md" marginLeft="8" textAlign="left">
                                    Proportional investment
                                </Heading>
                            ) : null}
                        </BeetsModalHeader>
                        <BeetsModalBody p="0">
                            <FadeInBox isVisible={modalState === 'start'}>
                                {!createRelic && selectedRelic && (
                                    <Box px="4">
                                        <Alert status="warning" mb="4">
                                            <AlertIcon />
                                            Investing more funds into your relic will affect your level up progress.
                                        </Alert>
                                    </Box>
                                )}
                                <ReliquaryInvestTypeChoice
                                    onShowProportional={() => {
                                        setInvestType('proportional');
                                        setModalState('proportional');
                                        clearInvestState();
                                    }}
                                    onShowCustom={() => {
                                        setInvestType('custom');
                                        setModalState('custom');
                                        clearInvestState();
                                    }}
                                />
                            </FadeInBox>
                            <FadeInBox isVisible={modalState === 'proportional'}>
                                <ReliquaryInvestProportional
                                    onShowPreview={() => {
                                        setInvestType('proportional');
                                        setModalState('preview');
                                    }}
                                />
                            </FadeInBox>
                            <FadeInBox isVisible={modalState === 'custom'}>
                                <ReliquaryInvestCustom
                                    onShowPreview={() => {
                                        setInvestType('custom');
                                        setModalState('preview');
                                    }}
                                />
                            </FadeInBox>
                            <FadeInBox isVisible={modalState === 'preview'}>
                                <ReliquaryInvestPreview
                                    onInvestComplete={() => {
                                        setInvestComplete(true);
                                    }}
                                    onClose={onModalClose}
                                />
                            </FadeInBox>
                        </BeetsModalBody>
                    </BeetsModalContent>
                </AnimatePresence>
            </Modal>
        </Box>
    );
}
