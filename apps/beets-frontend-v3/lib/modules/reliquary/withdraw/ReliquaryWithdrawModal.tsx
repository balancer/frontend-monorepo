import { Modal, ModalBody, ModalCloseButton, ModalContent } from '@chakra-ui/modal';
import { Button, ButtonProps, Heading, IconButton, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react';
import { ChevronLeft } from 'react-feather';
import { useEffect, useRef, useState } from 'react';
import { ReliquaryWithdrawTypeChoice } from '~/modules/reliquary/withdraw/components/ReliquaryWithdrawTypeChoice';
import { ReliquaryWithdrawProportional } from '~/modules/reliquary/withdraw/components/ReliquaryWithdrawProportional';
import { ReliquaryWithdrawSingleAsset } from '~/modules/reliquary/withdraw/components/ReliquaryWithdrawSingleAsset';
import { ReliquaryWithdrawPreview } from '~/modules/reliquary/withdraw/components/ReliquaryWithdrawPreview';
import { FadeInBox } from '~/components/animation/FadeInBox';
import { useReliquaryWithdrawState } from '~/modules/reliquary/withdraw/lib/useReliquaryWithdrawState';
import { useReliquary } from '../ReliquaryProvider';

interface Props {
    activatorProps?: ButtonProps;
    noActivator?: boolean;
    isVisible?: boolean;
    onClose?: () => void;
}
export function ReliquaryWithdrawModal({
    activatorProps = {},
    noActivator = false,
    onClose: _onClose,
    isVisible = false,
}: Props) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [modalState, setModalState] = useState<'start' | 'proportional' | 'single-asset' | 'preview'>('start');
    const [type, setInvestType] = useState<'proportional' | 'single-asset' | null>(null);
    const initialRef = useRef(null);
    const [withdrawComplete, setWithdrawComplete] = useState(false);
    const { clearWithdrawState } = useReliquaryWithdrawState();
    const { selectedRelicId } = useReliquary();

    useEffect(() => {
        setModalState('start');
        clearWithdrawState();
    }, [selectedRelicId]);

    function onModalClose() {
        if (withdrawComplete) {
            setModalState('start');
            setInvestType(null);
        }

        onClose();
        _onClose && _onClose();
    }

    useEffect(() => {
        if (isVisible) {
            onOpen();
        } else {
            onModalClose();
        }
    }, [isVisible]);

    return (
        <>
            {!noActivator && (
                <Button onClick={onOpen} variant="secondary" width={{ base: 'full', md: '140px' }} {...activatorProps}>
                    Withdraw
                </Button>
            )}
            <Modal
                isOpen={isOpen}
                onClose={onModalClose}
                size={modalState === 'start' ? '3xl' : 'lg'}
                initialFocusRef={initialRef}
            >
                <ModalOverlay />
                <ModalContent backgroundColor="base.700">
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
                            top="8px"
                            left="12px"
                            onClick={() => {
                                if (modalState === 'proportional' || modalState === 'single-asset') {
                                    setModalState('start');
                                } else if (modalState === 'preview') {
                                    if (type === 'proportional') {
                                        setModalState('proportional');
                                    } else if (type === 'single-asset') {
                                        setModalState('single-asset');
                                    }
                                }
                            }}
                        />
                    ) : null}
                    <ModalHeader>
                        {modalState === 'start' ? (
                            <>
                                <Heading size="md" noOfLines={1}>
                                    Withdraw from Reliquary
                                </Heading>
                            </>
                        ) : null}

                        {modalState === 'proportional' ? (
                            <Heading size="md" textAlign="center">
                                Proportional withdraw
                            </Heading>
                        ) : null}

                        {modalState === 'single-asset' ? (
                            <Heading size="md" textAlign="center">
                                Single asset withdraw
                            </Heading>
                        ) : null}

                        {modalState === 'preview' ? (
                            <Heading size="md" textAlign="center">
                                Withdraw preview
                            </Heading>
                        ) : null}
                    </ModalHeader>
                    <ModalBody p="0">
                        <FadeInBox isVisible={modalState === 'start'}>
                            <ReliquaryWithdrawTypeChoice
                                onShowProportional={() => {
                                    setInvestType('proportional');
                                    setModalState('proportional');
                                }}
                                onShowSingleAsset={() => {
                                    setInvestType('single-asset');
                                    setModalState('single-asset');
                                }}
                            />
                        </FadeInBox>
                        <FadeInBox isVisible={modalState === 'proportional'}>
                            <ReliquaryWithdrawProportional
                                onShowPreview={() => {
                                    setInvestType('proportional');
                                    setModalState('preview');
                                }}
                            />
                        </FadeInBox>
                        <FadeInBox isVisible={modalState === 'single-asset'}>
                            <ReliquaryWithdrawSingleAsset
                                onShowPreview={() => {
                                    setInvestType('single-asset');
                                    setModalState('preview');
                                }}
                            />
                        </FadeInBox>
                        <FadeInBox isVisible={modalState === 'preview'}>
                            <ReliquaryWithdrawPreview
                                onWithdrawComplete={() => {
                                    setWithdrawComplete(true);
                                }}
                                onClose={onModalClose}
                            />
                        </FadeInBox>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}
