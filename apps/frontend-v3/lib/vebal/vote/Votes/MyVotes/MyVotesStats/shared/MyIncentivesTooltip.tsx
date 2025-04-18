import StarsIcon from '@repo/lib/shared/components/icons/StarsIcon'
import { Icon, Stack, useTheme } from '@chakra-ui/react'
import { Popover, PopoverContent, PopoverTrigger, Text } from '@chakra-ui/react'

export function MyIncentivesTooltip() {
  const theme = useTheme()

  const popoverContent = (
    <PopoverContent bg="background.base" gap="md" minWidth={['100px']} px="0" py="ms" shadow="3xl">
      <Stack px="sm" spacing="sm" w="full">
        <Text color="font.secondary" fontSize="sm">
          {`Weekly bribes are provided by unaffiliated 3rd parties through the Hidden Hand platform
          to incentivize liquidity to certain pools. This does not include additional yield that veBAL
          holders also can earn (e.g. protocol revenue, extra boosts on liquidity mining incentives,
          and swap fees).`}
        </Text>
      </Stack>
    </PopoverContent>
  )

  return (
    <Popover trigger="hover">
      <>
        <PopoverTrigger>
          <Icon
            as={StarsIcon}
            gradFrom={theme.colors['red.400']}
            gradTo={theme.colors['red.400']}
          />
        </PopoverTrigger>

        {popoverContent}
      </>
    </Popover>
  )
}
