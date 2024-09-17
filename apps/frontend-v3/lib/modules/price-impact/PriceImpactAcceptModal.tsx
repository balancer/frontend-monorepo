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
import { useDebounce } from '@/lib/shared/hooks/useDebounce'
import { defaultDebounceMs } from '@/lib/shared/utils/queries'

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
    <Modal isOpen={isOpen} onClose={onClose} isCentered preserveScrollBarGap {...rest}>
      <ModalOverlay bg="blackAlpha.900" />
      <ModalContent>
        <ModalHeader color="font.primary">Are you sure?</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack w="full" align="start" spacing="md">
            <Text>
              You are at risk of losing money due to the high price impact. To acknowledge and
              accept this risk, type the following to proceed:
            </Text>
            <Code>{INPUT_TEXT}</Code>
            <Input placeholder={INPUT_TEXT} onChange={debouncedChangeHandler} />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            w="full"
            variant="primary"
            isDisabled={inputText !== INPUT_TEXT}
            onClick={handleClick}
          >
            I accept the risk
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
