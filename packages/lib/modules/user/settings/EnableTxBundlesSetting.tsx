'use client'

import { Box, Heading, Switch, Text } from '@chakra-ui/react'
import { useUserSettings } from './UserSettingsProvider'
import { useIsSafeApp } from '../../web3/safe.hooks'

function EnableTxBundleSelect() {
  const { enableTxBundling, setEnableTxBundling } = useUserSettings()

  const handleChange = () => {
    setEnableTxBundling(enableTxBundling === 'yes' ? 'no' : 'yes')
  }

  return <Switch isChecked={enableTxBundling === 'yes'} onChange={handleChange} />
}

export function EnableTxBundleSetting() {
  const shouldBeVisible = useIsSafeApp()

  if (shouldBeVisible) {
    return (
      <Box w="full">
        <Heading pb="xs" size="sm">
          Use Transaction Bundling
        </Heading>
        <Text color="font.secondary" fontSize="sm" pb="sm">
          Transaction bundles allow grouping transactions to be executed as one when possible.
          Disable this setting if you experience problems with grouped transactions.
        </Text>
        <EnableTxBundleSelect />
      </Box>
    )
  } else {
    return null
  }
}
