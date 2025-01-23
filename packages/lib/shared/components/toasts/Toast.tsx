'use client'

import {
  Box,
  VStack,
  useToast,
  ToastProps,
  IconButton,
  BoxProps,
  CircularProgress,
  HStack,
  CircularProgressLabel,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRef } from 'react'
import { ArrowUpRight, Check, X } from 'react-feather'

type Props = ToastProps & {
  linkUrl?: string
}

export function Toast({ id, status, isClosable, title, description, linkUrl, onClose }: Props) {
  const toast = useToast()

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
      toast.close(id)
      onClose?.()
    }
  }

  // Hach to make tooltip zIndex work in toast
  const ref = useRef(null)

  return (
    <Box position="relative" {...containerStyles}>
      <Box {...statusOverlayStyles} />
      <Box {...contentStyles}>
        {linkUrl && (
          <>
            <div ref={ref} />
            <Tooltip label="View on explorer" portalProps={{ containerRef: ref }}>
              <IconButton
                aria-label="View on explorer"
                as={Link}
                h="6"
                href={linkUrl}
                icon={<ArrowUpRight size={12} strokeWidth={3} />}
                position="absolute"
                right="8"
                size="xs"
                target="_blank"
                top="xs"
                w="6"
              />
            </Tooltip>
          </>
        )}

        {isClosable && (
          <IconButton
            aria-label="Close toast"
            h="6"
            icon={<X size={12} strokeWidth={3} />}
            onClick={closeToast}
            position="absolute"
            right="xs"
            size="xs"
            top="xs"
            w="6"
          />
        )}
        <HStack align="start">
          {status === 'loading' && (
            <CircularProgress
              color="font.warning"
              isIndeterminate
              mt="1"
              size={5}
              trackColor="border.base"
            />
          )}
          {status === 'success' && (
            <CircularProgress
              color="font.highlight"
              mt="1"
              size={5}
              trackColor="border.base"
              value={100}
            >
              <CircularProgressLabel color="font.highlight" fontSize="md" pl={1}>
                <Check size={12} strokeWidth={4} />
              </CircularProgressLabel>
            </CircularProgress>
          )}
          {status === 'error' && (
            <CircularProgress color="red.500" mt="1" size={5} trackColor="border.base" value={100}>
              <CircularProgressLabel>
                <Text color="red.500" fontSize="xs" fontWeight="bold">
                  !
                </Text>
              </CircularProgressLabel>
            </CircularProgress>
          )}
          <VStack align="start" spacing="none">
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
