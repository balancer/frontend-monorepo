'use client'

import { CheckCircleIcon, CopyIcon } from '@chakra-ui/icons'
import { IconButton, IconButtonProps, Tooltip } from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { useIsSafeApp } from '../web3/safe.hooks'

export function CopyAddressButton({
  address,
  ...rest
}: { address: string } & Omit<IconButtonProps, 'aria-label'>) {
  const [isCopied, setIsCopied] = useState(false)
  const isSafeApp = useIsSafeApp()
  const timeoutRef = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Copying to clipboard is not supported in Safe Apps due to iFrame security checks
  if (isSafeApp) return null

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(address)
      setIsCopied(true)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  return (
    <Tooltip label="Copy address">
      <IconButton
        aria-label="Copy address"
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
