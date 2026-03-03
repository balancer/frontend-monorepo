'use client'

import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import {
  VStack,
  Text,
  List,
  HStack,
  Button,
  useDisclosure,
  Link,
  Dialog,
  Portal } from '@chakra-ui/react';
import { ArrowUpRight, HelpCircle } from 'react-feather'
import { getDiscordLink } from '@repo/lib/shared/utils/links'

type LearnMoreModalProps = {
  listItems: string[]
  docsUrl: string
  buttonLabel: string
  headerText: string
  showHelpIcon?: boolean
}

export function LearnMoreModal({
  buttonLabel,
  docsUrl,
  headerText,
  listItems,
  showHelpIcon = false }: LearnMoreModalProps) {
  const { open, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button
        _hover={{ color: 'font.linkHover' }}
        color="font.link"
        gap="1.5"
        onClick={onOpen}
        variant="ghost"
      >
        {showHelpIcon && <HelpCircle size={16} />}
        {buttonLabel}
      </Button>
      <Dialog.Root placement='center' open={isOpen} size='lg' onOpenChange={e => {
        if (!e.open) {
          onClose();
        }
      }}>
        <Portal>

          <SuccessOverlay />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>{headerText}</Dialog.Header>
              <Dialog.CloseTrigger />
              <Dialog.Body pb="lg">
                <VStack gap="lg">
                  <List.Root color="font.primary" listStylePosition="outside" listStyleType="disc" pl="md">
                    {listItems.map((item, index) => (
                      <List.Item key={index}>
                        <Text>{item}</Text>
                      </List.Item>
                    ))}
                  </List.Root>
                  <HStack gap="ms" w="full">
                    <Button
                      display="flex"
                      gap="1"
                      isExternal
                      minWidth="184px"
                      size="md"
                      variant="secondary"
                      asChild><Link href={docsUrl}>View docs
                                              <ArrowUpRight size={14} />
                      </Link></Button>

                    <Button
                      display="flex"
                      gap="1"
                      isExternal
                      minWidth="184px"
                      size="md"
                      variant="tertiary"
                      asChild><Link href={getDiscordLink() || ''}>Get help on Discord
                                              <ArrowUpRight size={14} />
                      </Link></Button>
                  </HStack>
                </VStack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>

        </Portal>
      </Dialog.Root>
    </>
  );
}
