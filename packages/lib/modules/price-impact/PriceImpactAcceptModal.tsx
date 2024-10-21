'use client'

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  VStack,
  Text,
  Button,
  Input,
  ModalFooter,
  Code,
} from '@chakra-ui/react'
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
    <Modal isCentered isOpen={isOpen} onClose={onClose} preserveScrollBarGap {...rest}>
      <ModalOverlay bg="blackAlpha.900" />
      <ModalContent>
        <ModalHeader color="font.primary">Are you sure?</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="start" spacing="md" w="full">
            <Text>
              You are at risk of losing money due to the high price impact. To acknowledge and
              accept this risk, type the following to proceed:
            </Text>
            <Code>{INPUT_TEXT}</Code>
            <Input onChange={debouncedChangeHandler} placeholder={INPUT_TEXT} />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            isDisabled={inputText !== INPUT_TEXT}
            onClick={handleClick}
            variant="primary"
            w="full"
          >
            I accept the risk
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
