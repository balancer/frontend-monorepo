import {
  Popover,
  PopoverTrigger,
  HStack,
  PopoverContent,
  PopoverArrow,
  Text,
} from '@chakra-ui/react'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { SpeedIcon } from '@repo/lib/shared/components/icons/SpeedIcon'

function getSpeedSettingLabel(id: string = 'default') {
  switch (id) {
    case 'rabby':
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

  console.log({ connector })

  return (
    <Popover placement="top" trigger="hover">
      <PopoverTrigger>
        <HStack gap="0">
          <SpeedIcon size={20} />
          <Text color="grayText" cursor="pointer" fontSize="sm">
            {speedSettingLabel}
          </Text>
        </HStack>
      </PopoverTrigger>
      <PopoverContent p="2" shadow="2xl" width="250px" zIndex="popover">
        <PopoverArrow bg="background.level3" />
        <Text color="grayText">
          {`This estimate assumes a '${speedSettingLabel}' transaction speed setting. A higher final gas cost likely means
          your wallet is set to a faster setting.`}
        </Text>
      </PopoverContent>
    </Popover>
  )
}
