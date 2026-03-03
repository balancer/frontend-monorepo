import { Alert, AlertProps, AlertStatus, CloseButton, VStack } from '@chakra-ui/react';
import { MouseEventHandler, ReactNode } from 'react'
import { AlertTriangle, Check, Loader, XOctagon } from 'react-feather'
import { BalAlertButtonLink } from './BalAlertButtonLink'
import { LightbulbIcon } from '../icons/LightbulbIcon'

export type BalAlertProps = {
  content: ReactNode | string
  title?: string
  learnMoreLink?: string
  status: AlertStatus
  isSoftWarning?: boolean
  isNavAlert?: boolean
  onClose?: MouseEventHandler
  ssr?: boolean
  action?: ReactNode
} & Omit<AlertProps, 'status' | 'children' | 'content'>

export function BalAlert({
  content,
  title,
  status,
  learnMoreLink,
  isSoftWarning = false,
  isNavAlert = false,
  ssr = false, // Use true whe rendering alerts on the server side
  onClose,
  action,
  ...rest
}: BalAlertProps) {
  const iconSize = {
    h: '24px',
    w: '24px' }
  return (
    <Alert.Root rounded={isNavAlert ? 'none' : 'default'} status={status} {...rest}>
      {ssr ? <Alert.Indicator {...iconSize} /> : <Alert.Indicator as={getAlertIcon(status)} {...iconSize} />}
      {title ? (
        <VStack align="start" gap="0.5" w="full">
          <Alert.Title
            color="black"
            display="flex"
            flexDirection="column"
            fontWeight="bold"
            w="full"
          >
            {title}
          </Alert.Title>
          <Alert.Description
            color="black"
            display="flex"
            flexDirection="column"
            fontWeight="medium"
            w="full"
          >
            {content}
          </Alert.Description>
        </VStack>
      ) : (
        <Alert.Title
          color="black"
          display="flex"
          flexDirection="column"
          fontWeight="medium"
          w="full"
          wordBreak="break-word"
        >
          {content}
        </Alert.Title>
      )}
      {learnMoreLink && <BalAlertButtonLink href={learnMoreLink}>More</BalAlertButtonLink>}
      {action}
      {isSoftWarning && (
        <CloseButton
          _hover={{
            transform: 'scale(1.2)' }}
          aria-label="Close"
          color="font.dark"
          ml="auto"
          onClick={onClose}
          size="sm"
          variant="softWarning"
        />
      )}
    </Alert.Root>
  );
}

function getAlertIcon(status: AlertStatus) {
  switch (status) {
    case 'info':
      return LightbulbIcon
    case 'warning':
      return AlertTriangle
    case 'success':
      return Check
    case 'error':
      return XOctagon
    case 'loading':
      return Loader
    default:
      return LightbulbIcon
  }
}
