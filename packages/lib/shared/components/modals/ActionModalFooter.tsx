'use client'

import { Button, Divider, HStack, ModalFooter, VStack, Link } from '@chakra-ui/react'
import { useStepWithTxBatch } from '@repo/lib/modules/transactions/transaction-steps/tx-batch.hooks'
import { AnimatePresence, motion } from 'motion/react'
import { PropsWithChildren } from 'react'
import { CornerDownLeft, MessageSquare } from 'lucide-react'
import { TransactionStep } from '../../../modules/transactions/transaction-steps/lib'
import { getDiscordLink } from '../../utils/links'

export function SuccessActions({
  returnLabel,
  returnAction,
}: {
  returnLabel?: string
  returnAction?: () => void
}) {
  return (
    <VStack w="full">
      <Divider />
      <HStack justify="space-between" w="full">
        <Button
          aria-label={returnLabel}
          leftIcon={<CornerDownLeft size="14" />}
          onClick={returnAction}
          size="xs"
          variant="ghost"
        >
          {returnLabel}
        </Button>
        <Button
          _hover={{
            color: 'font.maxContrast',
            textDecoration: 'none',
            background: 'whiteAlpha.200',
          }}
          as={Link}
          fontSize="xs !important"
          href={getDiscordLink()}
          isExternal
          leftIcon={<MessageSquare size="14" />}
          size="xs"
          variant="ghost"
        >
          Ask on Discord
        </Button>
      </HStack>
    </VStack>
  )
}

type Props = {
  isSuccess: boolean
  currentStep?: TransactionStep
  returnLabel: string
  returnAction: () => void
  urlTxHash?: string
}

export function ActionModalFooter(props: Props) {
  return (
    <ModalFooter>
      <ActionFooter {...props} />
    </ModalFooter>
  )
}

export function ActionFooter({
  isSuccess,
  currentStep,
  returnLabel,
  returnAction,
  urlTxHash,
}: Props) {
  // Avoid animations when displaying a historic receipt
  if (urlTxHash) {
    return <SuccessActions returnAction={returnAction} returnLabel={returnLabel} />
  }

  return (
    <AnimatePresence initial={false} mode="wait">
      {isSuccess ? (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.95 }}
          key="footer"
          style={{ width: '100%' }}
          transition={{ duration: 0.3 }}
        >
          <SuccessActions returnAction={returnAction} returnLabel={returnLabel} />
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
          <VStack w="full">
            {currentStep && <RenderActionButton currentStep={currentStep} key={currentStep.id} />}
          </VStack>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function RenderActionButton({ currentStep }: PropsWithChildren<{ currentStep: TransactionStep }>) {
  const { isStepWithTxBatch } = useStepWithTxBatch(currentStep)

  if (isStepWithTxBatch) return currentStep?.renderBatchAction?.(currentStep)

  return currentStep?.renderAction()
}
