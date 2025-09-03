import { Button, VStack } from '@chakra-ui/react'
import { LabelWithIcon } from '@repo/lib/shared/components/btns/button-group/LabelWithIcon'

import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { BalAlertLink } from '@repo/lib/shared/components/alerts/BalAlertLink'
import { ExternalLink } from 'react-feather'
import { Text } from '@chakra-ui/react'

interface ToggleHyperBlockSizeProps {
  isSetUsingBigBlocksPending: boolean
  setUsingBigBlocks: (shouldUseBigBlocks: boolean) => void
  setUsingBigBlocksError: Error | null
  shouldUseBigBlocks: boolean
}

export function ToggleHyperBlockSize({
  isSetUsingBigBlocksPending,
  setUsingBigBlocks,
  setUsingBigBlocksError,
  shouldUseBigBlocks,
}: ToggleHyperBlockSizeProps) {
  return (
    <VStack
      marginTop="2"
      paddingBottom="6"
      paddingLeft="6"
      paddingRight="6"
      spacing="3"
      width="full"
    >
      {setUsingBigBlocksError ? (
        <BalAlert content={setUsingBigBlocksError.message} status="error" title="Error:" />
      ) : (
        <BalAlert
          content={
            <Text color="font.primaryGradient">
              {shouldUseBigBlocks
                ? `The HyperEVM network requires your account switch to using big blocks to deploy contracts.`
                : `Your HyperEvm account is using big blocks. Switch to small blocks for faster transaction speeds.`}{' '}
              <BalAlertLink
                alignItems="center"
                display="inline-flex"
                href="https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/dual-block-architecture"
                isExternal
              >
                <span>See more information</span>
                <ExternalLink size={16} style={{ marginLeft: 2, verticalAlign: 'middle' }} />
              </BalAlertLink>
            </Text>
          }
          status="info"
        />
      )}

      <Button
        isDisabled={isSetUsingBigBlocksPending}
        isLoading={isSetUsingBigBlocksPending}
        onClick={() => setUsingBigBlocks(shouldUseBigBlocks)}
        size="lg"
        variant="primary"
        w="full"
      >
        <LabelWithIcon icon="sign">
          Switch to {shouldUseBigBlocks ? 'big' : 'small'} blocks
        </LabelWithIcon>
      </Button>
    </VStack>
  )
}
