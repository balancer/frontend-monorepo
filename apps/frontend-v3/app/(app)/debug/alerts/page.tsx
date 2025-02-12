'use client'

import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { BalAlertButton } from '@repo/lib/shared/components/alerts/BalAlertButton'
import { BalAlertContent } from '@repo/lib/shared/components/alerts/BalAlertContent'
import { GenericError } from '@repo/lib/shared/components/errors/GenericError'
import { VStack } from '@chakra-ui/react'

const exceptionName = 'Error fetching swap'
const exceptionMessage = `Execution reverted for an unknown reason. Raw Call Arguments:
to:0xE39B5e3B6D74016b2F6A9673D7d7493B6DF549d5
Docs: https://viem.sh/docs/contract/simulateContract Details: execution reverted Version:
viem@2.16.3`

class TestError extends Error {
  constructor(name: string, message: string) {
    super(message)
    this.name = name
  }
}

export default function Page() {
  return (
    <VStack width="full">
      <BalAlert content={<TitleWithButton title="Info alert" />} status="info" />
      <BalAlert content={<TitleWithButton title="Warning alert" />} status="warning" />
      <BalAlert content={<TitleWithButton title="Error alert" />} status="error" />
      <BalAlert content={<TitleWithButton title="Success alert" />} status="success" />
      <BalAlert
        content="Warning alert with close button (soft warning)"
        isSoftWarning
        status="warning"
      />
      <BalAlert
        content="Error alert with learn more button link"
        learnMoreLink="https://balancer.fi"
        status="error"
      />
      <BalAlert
        content={
          <BalAlertContent
            description="With description in the next line (forceColumnMode)"
            forceColumnMode
            title="Info alert"
          />
        }
        status="info"
      />

      <GenericError error={new TestError(exceptionName, exceptionMessage)} maxWidth="500" />
    </VStack>
  )
}

function TitleWithButton({ title }: { title: string }) {
  return (
    <BalAlertContent
      description="Optional description"
      title={title}
      tooltipLabel="Optional tooltip"
    >
      <BalAlertButton onClick={() => console.log('Clicked')}>Click me</BalAlertButton>
    </BalAlertContent>
  )
}
