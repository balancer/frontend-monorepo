'use client'

import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import {
  Modal,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalHeader,
  VStack,
  Text,
  HStack,
  Button,
  useDisclosure,
  Icon,
} from '@chakra-ui/react'
import { Trash2 } from 'react-feather'
import { getChainName } from '@repo/lib/config/app.config'
import { GqlChain, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { getPoolTypeLabel } from '@repo/lib/modules/pool/pool.utils'
import { Address } from 'viem'

type Props = {
  modalTitle?: string
  triggerTitle?: string
  poolAddress?: Address | undefined
  poolType: GqlPoolType
  network: GqlChain
  handleRestart: () => void
  isAbsolutePosition?: boolean
}

export function RestartPoolCreationModal({
  triggerTitle = 'Delete & restart',
  modalTitle = 'Delete progress and start over',
  poolType,
  network,
  handleRestart,
  poolAddress,
  isAbsolutePosition,
}: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const chainName = getChainName(network)
  const poolTypeName = getPoolTypeLabel(poolType)

  return (
    <>
      <Button
        _hover={{ color: 'font.linkHover', cursor: 'pointer' }}
        onClick={onOpen}
        size="xs"
        variant="ghost"
        {...(isAbsolutePosition && {
          position: 'absolute',
          right: '-240px',
          top: '-40px',
          width: '250px',
        })}
      >
        <HStack>
          <Icon as={Trash2} color="font.secondary" size={16} />
          <Text color="font.secondary">{triggerTitle}</Text>
        </HStack>
      </Button>
      <Modal isCentered isOpen={isOpen} onClose={onClose} size="lg">
        <SuccessOverlay />
        <ModalContent bg="background.level1">
          <ModalHeader fontSize="2xl">{modalTitle}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="lg">
            <VStack>
              {poolAddress ? (
                <VStack align="start" spacing="md">
                  <Text>
                    You have deployed a v3 {poolType} pool but have not seeded it with liquidity.
                    Pool address:
                  </Text>
                  <Text color="font.link">{poolAddress}</Text>
                  <Text>
                    Although it has been created on the {getChainName(network)} network, it will not
                    appear on the Balancer UI and it will not be accessible to liquidity providers
                    if you abandon it now.
                  </Text>
                  <Text>Are you sure you want to abandon it and delete all associated data?</Text>
                </VStack>
              ) : (
                <Text color="font.primary">
                  {`You have begun the process of creating a new ${poolTypeName} pool on the ${chainName} network. Are you sure you want to delete all progress and start again from scratch?`}
                </Text>
              )}
              <HStack gap="ms" mt="md" w="full">
                <Button
                  display="flex"
                  flex="1"
                  gap="1"
                  minWidth="184px"
                  onClick={() => {
                    handleRestart()
                    onClose()
                  }}
                  size="lg"
                  variant="danger"
                >
                  {poolAddress ? 'Abandon set up' : 'Delete and start over'}
                </Button>
                <Button
                  display="flex"
                  flex="1"
                  gap="1"
                  minWidth="184px"
                  onClick={onClose}
                  size="lg"
                  variant="tertiary"
                >
                  Continue set up
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
