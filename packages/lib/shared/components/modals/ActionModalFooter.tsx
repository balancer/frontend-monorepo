import { useAppzi } from '@repo/lib/shared/hooks/useAppzi'
import { Button, Divider, HStack, ModalFooter, VStack } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { CornerDownLeft, MessageSquare, ThumbsUp } from 'react-feather'
import { TransactionStep } from '../../../modules/transactions/transaction-steps/lib'
import { getProjectConfig } from '@repo/lib/config/getProjectConfig'

export function SuccessActions({
  returnLabel,
  returnAction,
}: {
  returnLabel?: string
  returnAction?: () => void
}) {
  const { openNpsModal } = useAppzi()

  return (
    <VStack w="full">
      <Divider />
      <HStack justify="space-between" w="full">
        <Button
          leftIcon={<CornerDownLeft size="14" />}
          onClick={returnAction}
          size="xs"
          variant="ghost"
        >
          {returnLabel}
        </Button>
        <Button leftIcon={<ThumbsUp size="14" />} onClick={openNpsModal} size="xs" variant="ghost">
          Give feedback
        </Button>
        <Button
          as={Link}
          href={getProjectConfig().externalLinks.discordUrl}
          leftIcon={<MessageSquare size="14" />}
          size="xs"
          target="_blank"
          variant="ghost"
        >
          Ask questions
        </Button>
      </HStack>
    </VStack>
  )
}

type Props = {
  isSuccess: boolean
  currentStep: TransactionStep
  returnLabel: string
  returnAction: () => void
  urlTxHash?: string
}

export function ActionModalFooter({
  isSuccess,
  currentStep,
  returnLabel,
  returnAction,
  urlTxHash,
}: Props) {
  // Avoid animations when displaying a historic receipt
  if (urlTxHash) {
    return (
      <ModalFooter>
        <SuccessActions returnAction={returnAction} returnLabel={returnLabel} />
      </ModalFooter>
    )
  }
  return (
    <ModalFooter>
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
              {/* Keep currentStep?. optional chaining cause some edge cases require it */}
              {currentStep?.renderAction()}
            </VStack>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalFooter>
  )
}
