'use client'
import { Box, VStack, IconButton, BoxProps, ProgressCircle, HStack, Link } from '@chakra-ui/react'
import { Tooltip } from '../../../shared/components/tooltips/Tooltip'
import { useRef } from 'react'
import { ArrowUpRight, X } from 'react-feather'
import { toaster } from './toaster'
import { ToastStatus } from '../../hooks/useToast'
import { ReactNode } from 'react'

type Props = {
  id?: string
  status?: ToastStatus
  isClosable?: boolean
  title?: ReactNode
  description?: ReactNode
  onClose?: () => void
  linkUrl?: string
}

export function Toast({ id, status, isClosable, title, description, linkUrl, onClose }: Props) {
  const containerStyles: BoxProps = {
    background: 'background.level3',
    border: 'none',
    rounded: 'md',
    shadow: 'xl',
    zIndex: '1000',
    width: 'xs',
  }

  const statusOverlayStyles: BoxProps = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    w: 'full',
    h: 'full',
    background:
      status === 'loading'
        ? 'orange.300'
        : status === 'success'
          ? 'green.300'
          : status === 'error'
            ? 'red.300'
            : 'transparent',
    opacity: 0.2,
    rounded: 'md',
    zIndex: 1001,
  }

  const contentStyles: BoxProps = {
    w: 'full',
    h: 'full',
    position: 'relative',
    padding: 'md',
    zIndex: 1002,
  }

  function closeToast() {
    if (id) {
      toaster.dismiss(id)
      onClose?.()
    }
  }

  // Hack to make tooltip zIndex work in toast
  const ref = useRef(null)

  return (
    <Box position="relative" {...containerStyles}>
      <Box {...statusOverlayStyles} />
      <Box {...contentStyles}>
        {linkUrl && (
          <>
            <div ref={ref} />
            <Tooltip content="View on explorer">
              <IconButton
                aria-label="View on explorer"
                asChild
                h="6"
                position="absolute"
                right="8"
                size="xs"
                top="xs"
                w="6"
              >
                <Link href={linkUrl} rel="noopener noreferrer" target="_blank">
                  <ArrowUpRight size={12} strokeWidth={3} />
                </Link>
              </IconButton>
            </Tooltip>
          </>
        )}

        {isClosable && (
          <IconButton
            aria-label="Close toast"
            h="6"
            onClick={closeToast}
            position="absolute"
            right="xs"
            size="xs"
            top="xs"
            w="6"
          >
            <X size={12} strokeWidth={3} />
          </IconButton>
        )}
        <HStack align="start">
          {status === 'loading' && (
            <ProgressCircle.Root mt="1" size="sm" trackColor="border.base" value={null}>
              <ProgressCircle.Circle>
                <ProgressCircle.Track />
                <ProgressCircle.Range stroke="font.warning" />
              </ProgressCircle.Circle>
            </ProgressCircle.Root>
          )}
          {status === 'success' && (
            <ProgressCircle.Root mt="1" size="sm" trackColor="border.base" value={100}>
              <ProgressCircle.Circle>
                <ProgressCircle.Track />
                <ProgressCircle.Range stroke="font.highlight" />
              </ProgressCircle.Circle>
            </ProgressCircle.Root>
          )}
          {status === 'error' && (
            <ProgressCircle.Root mt="1" size="sm" trackColor="border.base" value={100}>
              <ProgressCircle.Circle>
                <ProgressCircle.Track />
                <ProgressCircle.Range stroke="red.500" />
              </ProgressCircle.Circle>
            </ProgressCircle.Root>
          )}
          <VStack align="start" gap="none">
            <Box color="font.primary" fontSize="md" fontWeight="bold">
              {title}
            </Box>
            {description && <Box fontSize="sm">{description}</Box>}
          </VStack>
        </HStack>
      </Box>
    </Box>
  )
}
