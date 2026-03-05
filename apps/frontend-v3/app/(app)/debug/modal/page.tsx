'use client'

import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { TransactionModalHeader } from '@repo/lib/shared/components/modals/TransactionModalHeader'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useDisclosure } from '@chakra-ui/react'
import { Button, Box, Dialog, Portal } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Hex } from 'viem'

export default function ModalPage() {
  const { open, onOpen, onClose } = useDisclosure()
  const [txHash, setTxHash] = useState<Hex | undefined>(undefined)

  function toggleSuccess() {
    setTxHash(txHash ? undefined : '0x123')
  }

  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>
      <Dialog.Root placement='center' open={open} onOpenChange={(e: any) => {
        if (!e.open) {
          onClose();
        }
      }}>
        <Portal>

          <SuccessOverlay startAnimation={!!txHash} />
          <Dialog.Positioner>
            <Dialog.Content>
              <TransactionModalHeader chain={GqlChain.Mainnet} label="Add liquidity" txHash={txHash} />
              <Dialog.CloseTrigger />
              <motion.div animate={{ height: 'auto' }}>
                <AnimatePresence initial={false}>
                  <Dialog.Body>
                    <AnimatePresence initial={false} mode="wait">
                      {txHash ? (
                        <motion.div
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          initial={{ opacity: 0, scale: 0.95 }}
                          key="receipt"
                          transition={{ duration: 0.3 }}
                        >
                          <Box bg="red" h="100px" w="full" />
                        </motion.div>
                      ) : (
                        <motion.div
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          initial={{ opacity: 0, scale: 0.95 }}
                          key="preview"
                          transition={{ duration: 0.3 }}
                        >
                          <Box bg="blue" h="200px" w="full" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Dialog.Body>
                </AnimatePresence>
              </motion.div>
              <Dialog.Footer>
                <AnimatePresence initial={false} mode="wait">
                  {txHash ? (
                    <motion.div
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      key="footer"
                      style={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button onClick={toggleSuccess} size="lg" w="full">
                        Toggle
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      key="action"
                      style={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button onClick={toggleSuccess} size="lg" w="full">
                        Toggle
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>

        </Portal>
      </Dialog.Root>
    </>
  );
}
