import { Modal, ModalBody, ModalContent, ModalProps } from '@chakra-ui/react'
import { RefObject, useRef } from 'react'
import { VStack, Button, HStack, Text } from '@chakra-ui/react'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { useLbpMetadata } from '../LbpMetadataProvider'

type Props = {
  onClose(): void
  onOpen(): void
  finalFocusRef?: RefObject<HTMLInputElement | null>
}

export function LbpMetadataErrorModal({
  onClose,
  finalFocusRef,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  const initialFocusRef = useRef(null)
  const { saveMetadata, error: saveMetadataError } = useLbpMetadata()

  return (
    <Modal
      finalFocusRef={finalFocusRef}
      initialFocusRef={initialFocusRef}
      isCentered
      onClose={onClose}
      preserveScrollBarGap
      {...rest}
    >
      <ModalContent minHeight="333">
        {/* <ModalCloseButton /> */}
        <ModalBody>
          <VStack
            height="full"
            justify="space-between"
            paddingBottom="5"
            paddingTop="5"
            spacing="xl"
            width="full"
          >
            <Text fontSize="lg" fontWeight="bold">
              Error Saving Metadata
            </Text>

            <BalAlert
              content={saveMetadataError?.message}
              status="error"
              title={saveMetadataError?.title}
            />

            <Button
              isDisabled={false}
              isLoading={false}
              marginTop="4"
              onClick={saveMetadata}
              size="lg"
              variant="secondary"
              w="full"
            >
              <HStack justifyContent="center" spacing="sm" width="100%">
                <Text color="font.primaryGradient" fontWeight="bold">
                  Retry Save Metadata
                </Text>
              </HStack>
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
