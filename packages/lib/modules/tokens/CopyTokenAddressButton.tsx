'use client'

import { CheckCircleIcon, CopyIcon } from '@chakra-ui/icons'
import { IconButton, IconButtonProps, Tooltip } from '@chakra-ui/react'
import { useState } from 'react'

export function CopyTokenAddressButton({
  tokenAddress,
  ...rest
}: { tokenAddress: string } & Omit<IconButtonProps, 'aria-label'>) {
  const [isCopied, setIsCopied] = useState(false)

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
