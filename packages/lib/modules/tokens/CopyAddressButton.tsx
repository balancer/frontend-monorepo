'use client';
import { IconButton, IconButtonProps } from '@chakra-ui/react';
import { Tooltip } from '../../shared/components/tooltips/Tooltip'
import { useCopyToClipboard } from '@repo/lib/shared/hooks/useCopyToClipboard'
import { useIsSafeApp } from '../web3/safe.hooks'
import { LuCircleCheck, LuCopy } from 'react-icons/lu';

export function CopyAddressButton({
  address,
  ...rest
}: { address: string } & Omit<IconButtonProps, 'aria-label'>) {
  const { copyToClipboard, isCopied } = useCopyToClipboard()
  const isSafeApp = useIsSafeApp()

  // Copying to clipboard is not supported in Safe Apps due to iFrame security checks
  if (isSafeApp) return null

  return (
    <Tooltip content="Copy address">
      <IconButton
        aria-label="Copy address"
        h="6"
        isRound
        onClick={() => copyToClipboard(address)}
        size="xs"
        variant="ghost"
        w="6"
        {...rest}>{isCopied ? <LuCircleCheck /> : <LuCopy />}</IconButton>
    </Tooltip>
  );
}
