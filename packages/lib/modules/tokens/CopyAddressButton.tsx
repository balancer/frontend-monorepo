'use client'

import { CheckCircleIcon, CopyIcon } from '@chakra-ui/icons'
import { IconButton, IconButtonProps, Tooltip } from '@chakra-ui/react'
import { useCopyToClipboard } from '@repo/lib/shared/hooks/useCopyToClipboard'
import { useIsSafeApp } from '../web3/safe.hooks'

export function CopyAddressButton({
  address,
  ...rest
}: { address: string } & Omit<IconButtonProps, 'aria-label'>) {
  const { copyToClipboard, isCopied } = useCopyToClipboard()
  const isSafeApp = useIsSafeApp()

  // Copying to clipboard is not supported in Safe Apps due to iFrame security checks
  if (isSafeApp) return null

  return (
    <Tooltip label="Copy address">
      <IconButton
        aria-label="Copy address"
        h="6"
        icon={isCopied ? <CheckCircleIcon /> : <CopyIcon />}
        isRound
        onClick={() => copyToClipboard(address)}
        size="xs"
        variant="ghost"
        w="6"
        {...rest}
      />
    </Tooltip>
  )
}
