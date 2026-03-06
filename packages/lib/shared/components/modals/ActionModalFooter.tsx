'use client'
import { Button, HStack, VStack, Link, Separator, Dialog } from '@chakra-ui/react'
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { useStepWithTxBatch } from '@repo/lib/modules/web3/safe.hooks'
import { useAppzi } from '@repo/lib/shared/hooks/useAppzi'
import { AnimatePresence, motion } from 'framer-motion'
import { PropsWithChildren } from 'react'
import { CornerDownLeft, MessageSquare, ThumbsUp } from 'react-feather'
import { TransactionStep } from '../../../modules/transactions/transaction-steps/lib'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { getDiscordLink } from '../../utils/links'

export function SuccessActions({
  returnLabel,
  returnAction,
}: {
  returnLabel?: string
  returnAction?: () => void
}) {
  const { openNpsModal } = useAppzi()
  const colorMode = useThemeColorMode()
  const {
    options: { showVeBal },
  } = PROJECT_CONFIG

  return (
    <VStack w="full">
      <Separator />
      <HStack justify="space-between" w="full">
        <Button aria-label={returnLabel} onClick={returnAction} size="xs" variant="ghost">
          <CornerDownLeft size="14" />
          {returnLabel}
        </Button>
        {showVeBal && (
          <Button onClick={openNpsModal} size="xs" variant="ghost">
            <ThumbsUp size="14" />
            Give feedback
          </Button>
        )}
        <Button
          _hover={{
            color: 'font.maxContrast',
            textDecoration: 'none',
            background: colorMode === 'light' ? 'gray.100' : 'whiteAlpha.200',
          }}
          asChild
          fontSize="xs !important"
          size="xs"
          variant="ghost"
        >
          <Link href={getDiscordLink()} rel="noopener noreferrer" target="_blank">
            <MessageSquare size="14" />
            Ask on Discord
          </Link>
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

export function ActionModalFooter(props: Props) {
  return (
    <Dialog.Footer>
      <ActionFooter {...props} />
    </Dialog.Footer>
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
