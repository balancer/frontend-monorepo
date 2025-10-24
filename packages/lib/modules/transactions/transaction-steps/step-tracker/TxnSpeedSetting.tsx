import {
  Box,
  Popover,
  PopoverTrigger,
  HStack,
  Image,
  PopoverContent,
  PopoverArrow,
  Text,
} from '@chakra-ui/react'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { SpeedIcon } from '@repo/lib/shared/components/icons/SpeedIcon'

function getSpeedSettingLabel(id: string = 'default') {
  switch (id) {
    case 'rabby':
    case 'io.rabby':
      return 'Normal'
    case 'metaMaskSDK':
      return 'Low'
    default:
      return 'Slow'
  }
}

export function TxnSpeedSetting() {
  const { connector } = useUserAccount()

  const speedSettingLabel = getSpeedSettingLabel(connector?.id)
  const userWalletLabel = connector?.name || 'your wallet'

  console.log({ connector })

  return (
    <Popover placement="top" trigger="hover">
      <PopoverTrigger>
        <HStack gap="xs">
          <Image height="14px" src={connector?.icon} width="14px" />
          <Box color="font.secondary" position="relative" top="0px">
            <SpeedIcon size={14} />
          </Box>
          <Text color="grayText" cursor="pointer" fontSize="xs">
            {speedSettingLabel}
          </Text>
        </HStack>
      </PopoverTrigger>
      <PopoverContent p="2" shadow="2xl" width="250px" zIndex="popover">
        <PopoverArrow bg="background.level3" />
        <Text color="grayText" fontSize="sm">
          {`This is a general estimate to give you a sense of the cost based on a '${speedSettingLabel}' speed transaction on your ${userWalletLabel}. This UI can’t access your wallet’s transaction speed, so the estimate may be inaccurate if your wallet is set to a higher speed.`}
        </Text>
      </PopoverContent>
    </Popover>
  )
}
