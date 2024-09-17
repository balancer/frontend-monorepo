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
        size="xs"
        isRound
        variant="ghost"
        w="6"
        h="6"
        aria-label="Copy token address"
        icon={isCopied ? <CheckCircleIcon /> : <CopyIcon />}
        onClick={copyToClipboard}
        {...rest}
      />
    </Tooltip>
  )
}
