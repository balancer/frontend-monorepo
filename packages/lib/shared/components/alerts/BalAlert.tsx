import { Alert, AlertIcon, AlertStatus, AlertTitle, CloseButton } from '@chakra-ui/react'
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
}

export function BalAlert({
  content,
  status,
  learnMoreLink,
  isSoftWarning = false,
  isNavAlert = false,
  ssr = false, // Use true whe rendering alerts on the server side
  onClose,
}: BalAlertProps) {
  return (
    <Alert status={status} rounded={isNavAlert ? 'none' : 'default'}>
      {ssr ? <AlertIcon /> : <AlertIcon as={getAlertIcon(status)} />}

      <AlertTitle
        gap={1}
        display="flex"
        w="full"
        color="black"
        wordBreak="break-word"
        flexDirection="column"
      >
        {content}
      </AlertTitle>
      {learnMoreLink && <BalAlertButtonLink href={learnMoreLink}>More</BalAlertButtonLink>}
      {isSoftWarning && (
        <CloseButton
          onClick={onClose}
          variant="softWarning"
          color="font.dark"
          ml="auto"
          size="sm"
          aria-label="Close"
          _hover={{
            transform: 'scale(1.2)',
          }}
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
