import {
  Alert,
  AlertIcon,
  AlertProps,
  AlertStatus,
  AlertTitle,
  CloseButton,
} from '@chakra-ui/react'
import { MouseEventHandler, ReactNode } from 'react'
import { AlertTriangle, Check, Info, Loader, XOctagon } from 'react-feather'
import { BalAlertButtonLink } from './BalAlertButtonLink'

export type BalAlertProps = {
  content: ReactNode | string
  learnMoreLink?: string
  status: AlertStatus
  isSoftWarning?: boolean
  isNavAlert?: boolean
  onClose?: MouseEventHandler
  ssr?: boolean
} & Omit<AlertProps, 'status' | 'children' | 'content'>

export function BalAlert({
  content,
  status,
  learnMoreLink,
  isSoftWarning = false,
  isNavAlert = false,
  ssr = false, // Use true whe rendering alerts on the server side
  onClose,
  ...rest
}: BalAlertProps) {
  return (
    <Alert rounded={isNavAlert ? 'none' : 'default'} status={status} {...rest}>
      {ssr ? <AlertIcon /> : <AlertIcon as={getAlertIcon(status)} />}

      <AlertTitle
        color="black"
        display="flex"
        flexDirection="column"
        gap={1}
        w="full"
        wordBreak="break-word"
      >
        {content}
      </AlertTitle>
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
      return Info
    case 'warning':
      return AlertTriangle
    case 'success':
      return Check
    case 'error':
      return XOctagon
    case 'loading':
      return Loader
    default:
      return Info
  }
}
