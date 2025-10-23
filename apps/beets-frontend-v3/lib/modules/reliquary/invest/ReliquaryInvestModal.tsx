import { Modal, ModalCloseButton } from '@chakra-ui/modal'
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
} from '@chakra-ui/react'
import { ChevronLeft } from 'react-feather'
import { ReliquaryInvestPreview } from '~/modules/reliquary/invest/components/ReliquaryInvestPreview'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { animate, AnimatePresence, motion, useAnimation } from 'framer-motion'
import { BeetsModalBody, BeetsModalContent, BeetsModalHeader } from '~/components/modal/BeetsModal'
import { useReliquary } from '~/modules/reliquary/ReliquaryProvider'
import { ReliquaryInvestTypeChoice } from './components/ReliquaryInvestTypeChoice'
import { ReliquaryInvestCustom } from './components/ReliquaryInvestCustom'
import { ReliquaryInvestProportional } from './components/ReliquaryInvestProportional'
import { useReliquaryInvestState } from './lib/useReliquaryInvestState'
import { FadeInBox } from '~/components/animation/FadeInBox'

interface Props {
  createRelic?: boolean
  activatorLabel?: string
  activatorProps?: ButtonProps
  noActivator?: boolean
  isVisible?: boolean
  onClose?: () => void
  isConnected?: boolean
}

function getInvertedTransform(startBounds: DOMRect, endBounds: DOMRect) {
  return {
    x: startBounds.x - endBounds.x,
    y: startBounds.y - endBounds.y,
    scaleX: startBounds.width / endBounds.width,
    scaleY: startBounds.height / endBounds.height,
  }
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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [modalState, setModalState] = useState<'start' | 'proportional' | 'custom' | 'preview'>(
    'start'
  )
  const [type, setInvestType] = useState<'proportional' | 'custom' | null>(null)
  const initialRef = useRef(null)
  const [investComplete, setInvestComplete] = useState(false)
  const { selectedRelic, setCreateRelic } = useReliquary()
  const containerControls = useAnimation()
  const modalContainerRef = useRef<HTMLDivElement | null>(null)
  const lastModalBounds = useRef<DOMRect | null>(null)
  const { clearInvestState } = useReliquaryInvestState()

  function onModalOpen() {
    if (createRelic) {
      setCreateRelic(true)
    } else {
      setCreateRelic(false)
    }
    onOpen()
  }

  function onModalClose() {
    if (investComplete) {
      setInvestType(null)
      setCreateRelic(false)
    }
    setModalState('start')
    clearInvestState()
    onClose()
    _onClose && _onClose()
  }

  useEffect(() => {
    if (isVisible) {
      onModalOpen()
    } else {
      onModalClose()
    }
  }, [isVisible])

  useLayoutEffect(() => {
    setTimeout(async () => {
      if (isOpen) {
        if (modalContainerRef.current) {
          containerControls.set({
            opacity: 0,
            transform: 'scale(.75)',
          })
        }
        await containerControls.start({
          opacity: 1,
          transform: 'scale(1)',
        })

        const bounds = modalContainerRef.current?.getBoundingClientRect()
        if (bounds) {
          lastModalBounds.current = bounds
        }
      } else {
        containerControls.start({
          opacity: 0,
          transform: 'scale(0.75)',
        })
      }
    }, 0)
  }, [isOpen])

  useLayoutEffect(() => {
    if (modalContainerRef.current) {
      const bounds = modalContainerRef.current.getBoundingClientRect()
      if (lastModalBounds.current) {
        const invertedTransform = getInvertedTransform(lastModalBounds.current, bounds)
        animate(invertedTransform.scaleY, 1, {
          onUpdate: t => {
            if (modalContainerRef.current) {
              modalContainerRef.current.style.transform = `scaleY(${t})`
            }
          },
        })
      }
      lastModalBounds.current = bounds
    }
  }, [modalState])

  return (
    <Box width="full">
      {!noActivator && (
        <Button
          disabled={!isConnected}
          onClick={onModalOpen}
          variant="primary"
          width="full"
          {...activatorProps}
        >
          {activatorLabel || 'Get maBEETS'}
        </Button>
      )}
      <Modal
        initialFocusRef={initialRef}
        isOpen={isOpen}
        motionPreset="none"
        onClose={onModalClose}
        size="lg"
      >
        <ModalOverlay bg="blackAlpha.900" />
        <AnimatePresence exitBeforeEnter>
          <BeetsModalContent isTransparent={true} position="relative">
            <Box
              animate={containerControls}
              as={motion.div}
              background="gray.700"
              height="full"
              left="0"
              position="absolute"
              ref={modalContainerRef}
              right="0"
              rounded="md"
              top="0"
              transformOrigin="top"
              width="full"
              zIndex={-1}
            >
              <Box background="blackAlpha.400" height="full" transformOrigin="top" width="full">
                <Box className="bg" height="full" width="full" />
              </Box>
            </Box>
            <ModalCloseButton />
            {modalState !== 'start' ? (
              <IconButton
                aria-label={'back-button'}
                height="32px"
                icon={<ChevronLeft />}
                left="12px"
                minWidth="32px"
                onClick={() => {
                  if (modalState === 'proportional' || modalState === 'custom') {
                    setModalState('start')
                  } else if (modalState === 'preview') {
                    if (type === 'proportional') {
                      setModalState('proportional')
                    } else if (type === 'custom') {
                      setModalState('custom')
                    }
                  }
                }}
                p="0"
                position="absolute"
                top="12px"
                variant="ghost"
                width="32px"
              />
            ) : null}
            <BeetsModalHeader>
              {modalState === 'start' ? (
                <>
                  <Heading noOfLines={1} size="md">
                    Invest into {createRelic ? 'a new  ' : 'an existing '}relic
                  </Heading>
                  <Text fontSize="1rem" fontWeight="normal">
                    Deposit into the fresh BEETS pool to get maBEETS.
                  </Text>
                </>
              ) : null}
              {modalState === 'proportional' ? (
                <Heading marginLeft="8" size="md" textAlign="left">
                  Proportional investment
                </Heading>
              ) : null}
            </BeetsModalHeader>
            <BeetsModalBody p="0">
              <FadeInBox isVisible={modalState === 'start'}>
                {!createRelic && selectedRelic && (
                  <Box px="4">
                    <Alert mb="4" status="warning">
                      <AlertIcon />
                      Investing more funds into your relic will affect your level up progress.
                    </Alert>
                  </Box>
                )}
                <ReliquaryInvestTypeChoice
                  onShowCustom={() => {
                    setInvestType('custom')
                    setModalState('custom')
                    clearInvestState()
                  }}
                  onShowProportional={() => {
                    setInvestType('proportional')
                    setModalState('proportional')
                    clearInvestState()
                  }}
                />
              </FadeInBox>
              <FadeInBox isVisible={modalState === 'proportional'}>
                <ReliquaryInvestProportional
                  onShowPreview={() => {
                    setInvestType('proportional')
                    setModalState('preview')
                  }}
                />
              </FadeInBox>
              <FadeInBox isVisible={modalState === 'custom'}>
                <ReliquaryInvestCustom
                  onShowPreview={() => {
                    setInvestType('custom')
                    setModalState('preview')
                  }}
                />
              </FadeInBox>
              <FadeInBox isVisible={modalState === 'preview'}>
                <ReliquaryInvestPreview
                  onClose={onModalClose}
                  onInvestComplete={() => {
                    setInvestComplete(true)
                  }}
                />
              </FadeInBox>
            </BeetsModalBody>
          </BeetsModalContent>
        </AnimatePresence>
      </Modal>
    </Box>
  )
}
