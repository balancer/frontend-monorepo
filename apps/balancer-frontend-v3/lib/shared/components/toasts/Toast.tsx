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

export function Toast({ id, status, isClosable, title, description, linkUrl }: Props) {
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
    if (id) toast.close(id)
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
                as={Link}
                href={linkUrl}
                target="_blank"
                position="absolute"
                size="xs"
                top="xs"
                right="8"
                aria-label="View on explorer"
                w="6"
                h="6"
                icon={<ArrowUpRight size={12} strokeWidth={3} />}
              />
            </Tooltip>
          </>
        )}

        {isClosable && (
          <IconButton
            onClick={closeToast}
            position="absolute"
            size="xs"
            top="xs"
            right="xs"
            aria-label="Close toast"
            w="6"
            h="6"
            icon={<X size={12} strokeWidth={3} />}
          />
        )}
        <HStack align="start">
          {status === 'loading' && (
            <CircularProgress
              isIndeterminate
              color="font.warning"
              trackColor="border.base"
              size={5}
              mt="1"
            />
          )}
          {status === 'success' && (
            <CircularProgress
              value={100}
              trackColor="border.base"
              size={5}
              color="font.highlight"
              mt="1"
            >
              <CircularProgressLabel fontSize="md" color="font.highlight" pl={1}>
                <Check size={12} strokeWidth={4} />
              </CircularProgressLabel>
            </CircularProgress>
          )}
          {status === 'error' && (
            <CircularProgress value={100} trackColor="border.base" size={5} color="red.500" mt="1">
              <CircularProgressLabel>
                <Text fontWeight="bold" color="red.500" fontSize="xs">
                  !
                </Text>
              </CircularProgressLabel>
            </CircularProgress>
          )}
          <VStack align="start" spacing="none">
            <Box color="font.primary" fontWeight="bold" fontSize="md">
              {title}
            </Box>
            {description && <Box fontSize="sm">{description}</Box>}
          </VStack>
        </HStack>
      </Box>
    </Box>
  )
}
