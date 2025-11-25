import { Alert } from '@chakra-ui/react'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function ApiOutageAlert() {
  const { projectName } = PROJECT_CONFIG

  return (
    <Alert color="font.dark" fontWeight="bold" rounded="none" status="warning">
      {`The ${projectName} API is currently down, causing most site features to be unavailable. The issue is
      being worked on to restore full service.`}
    </Alert>
  )
}
