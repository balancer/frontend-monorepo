'use client'

import { CheckCircleIcon, CopyIcon } from '@chakra-ui/icons'
import { IconButton, IconButtonProps, Tooltip } from '@chakra-ui/react'
import { useState } from 'react'
import { useIsSafeApp } from '../web3/safe.hooks'

export function CopyTokenAddressButton({
  tokenAddress,
  ...rest
}: { tokenAddress: string } & Omit<IconButtonProps, 'aria-label'>) {
  const [isCopied, setIsCopied] = useState(false)
  const isSafeApp = useIsSafeApp()

  // Copying to clipboard is not supported in Safe Apps due to iFrame security checks
  if (isSafeApp) return null

  function copyToClipboard() {
    navigator.clipboard.writeText(tokenAddress)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <Tooltip label="Copy token address">
      <IconButton
        aria-label="Copy token address"
        h="6"
        icon={isCopied ? <CheckCircleIcon /> : <CopyIcon />}
        isRound
        onClick={copyToClipboard}
        size="xs"
        variant="ghost"
        w="6"
        {...rest}
      />
    </Tooltip>
  )
}
