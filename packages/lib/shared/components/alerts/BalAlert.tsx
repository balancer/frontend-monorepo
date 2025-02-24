import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertProps,
  AlertStatus,
  AlertTitle,
  CloseButton,
  VStack,
} from '@chakra-ui/react'
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
  ...rest
}: BalAlertProps) {
  const iconSize = {
    h: '24px',
    w: '24px',
  }
  return (
    <Alert rounded={isNavAlert ? 'none' : 'default'} status={status} {...rest}>
      {ssr ? <AlertIcon {...iconSize} /> : <AlertIcon as={getAlertIcon(status)} {...iconSize} />}

      {title ? (
        <VStack align="start" w="full">
          <AlertTitle color="black" display="flex" flexDirection="column" w="full">
            {title}
          </AlertTitle>
          <AlertDescription color="black" display="flex" flexDirection="column" w="full">
            {content}
          </AlertDescription>
        </VStack>
      ) : (
        <AlertTitle
          color="black"
          display="flex"
          flexDirection="column"
          w="full"
          wordBreak="break-word"
        >
          {content}
        </AlertTitle>
      )}

      {learnMoreLink && <BalAlertButtonLink href={learnMoreLink}>More</BalAlertButtonLink>}
      {isSoftWarning && (
        <CloseButton
          _hover={{
            transform: 'scale(1.2)',
          }}
          aria-label="Close"
          color="font.dark"
          ml="auto"
          onClick={onClose}
          size="sm"
          variant="softWarning"
        />
      )}
    </Alert>
  )
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
