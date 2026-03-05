'use client'

import { ModalProps, VStack, Text, Button, Input, Code, Dialog, Portal } from '@chakra-ui/react';
import { useState } from 'react'
import { useDebounce } from '@repo/lib/shared/hooks/useDebounce'
import { defaultDebounceMs } from '@repo/lib/shared/utils/queries'

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
  setAcceptHighPriceImpact: (value: boolean) => void
}

const INPUT_TEXT = 'rekt risk'

export function PriceImpactAcceptModal({
  isOpen,
  onClose,
  setAcceptHighPriceImpact,
  ...rest
}: Props & Omit<ModalProps, 'children'>) {
  const [inputText, setInputText] = useState('')

  const handleClick = () => {
    if (inputText === INPUT_TEXT) {
      setAcceptHighPriceImpact(true)
      onClose()
    }
  }

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value)
  }

  const debouncedChangeHandler = useDebounce(changeHandler, defaultDebounceMs)

  return (
    <Dialog.Root
      placement='center'
      open={isOpen}
      {...rest}
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) {
          onClose();
        }
      }}>
      <Portal>

        <Dialog.Backdrop bg="blackAlpha.900" />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header color="font.primary">Are you sure?</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <VStack align="start" gap="md" w="full">
                <Text>
                  You are at risk of losing money due to high price impact and/or high swap fees. To
                  acknowledge and accept this risk, type the following to proceed:
                </Text>
                <Code>{INPUT_TEXT}</Code>
                <Input onValueChange={debouncedChangeHandler} placeholder={INPUT_TEXT} />
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                disabled={inputText !== INPUT_TEXT}
                onClick={handleClick}
                variant="primary"
                w="full"
              >
                I accept the risk
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>

      </Portal>
    </Dialog.Root>
  );
}
