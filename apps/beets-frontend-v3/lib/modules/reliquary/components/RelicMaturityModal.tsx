import { Modal, ModalCloseButton, ModalOverlay } from '@chakra-ui/react';
import React from 'react';
import { BeetsModalContent } from '~/components/modal/BeetsModal';
import RelicMaturity from './charts/RelicMaturity';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function RelicMaturityModal({ isOpen, onClose }: Props) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay bg="blackAlpha.900" />
            <BeetsModalContent width="full">
                <RelicMaturity />
                <ModalCloseButton />
            </BeetsModalContent>
        </Modal>
    );
}
