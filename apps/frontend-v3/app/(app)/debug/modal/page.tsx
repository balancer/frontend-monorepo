'use client'

import { SuccessOverlay } from '@/lib/shared/components/modals/SuccessOverlay'
import { TransactionModalHeader } from '@/lib/shared/components/modals/TransactionModalHeader'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { useDisclosure } from '@chakra-ui/hooks'
import {
  Button,
  Modal,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box,
} from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import useMeasure from 'react-use-measure'
import { Hex } from 'viem'

export default function ModalPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [txHash, setTxHash] = useState<Hex | undefined>(undefined)
  const [ref, { height }] = useMeasure()

  function toggleSuccess() {
    setTxHash(txHash ? undefined : '0x123')
  }

  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <SuccessOverlay startAnimation={!!txHash} />
        <ModalContent>
          <TransactionModalHeader label="Add liquidity" txHash={txHash} chain={GqlChain.Mainnet} />
          <ModalCloseButton />
          <motion.div animate={{ height: height || 'auto ' }}>
            <AnimatePresence initial={false}>
              <ModalBody ref={ref}>
                <AnimatePresence mode="wait" initial={false}>
                  {txHash ? (
                    <motion.div
                      key="receipt"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box h="100px" w="full" bg="red" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box h="200px" w="full" bg="blue" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </ModalBody>
            </AnimatePresence>
          </motion.div>

          <ModalFooter>
            <AnimatePresence mode="wait" initial={false}>
              {txHash ? (
                <motion.div
                  key="footer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: '100%' }}
                >
                  <Button onClick={toggleSuccess} w="full" size="lg">
                    Toggle
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="action"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: '100%' }}
                >
                  <Button onClick={toggleSuccess} w="full" size="lg">
                    Toggle
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
