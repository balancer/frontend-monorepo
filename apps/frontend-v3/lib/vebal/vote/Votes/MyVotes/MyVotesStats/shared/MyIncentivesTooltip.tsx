/*
 MIGRATION NOTE: The following Chakra UI hooks have been removed.
 Please replace them with the suggested alternatives:

//   - useTheme: Use Import from system or use useChakraContext

 See: https://chakra-ui.com/docs/get-started/migration#hooks
*/
import StarsIcon from '@repo/lib/shared/components/icons/StarsIcon'
import { Icon, Stack, HoverCard, Text } from '@chakra-ui/react'
import { useChakraContext } from '@chakra-ui/react'

export function MyIncentivesTooltip() {
  const system = useChakraContext()

  const popoverContent = (
    <HoverCard.Positioner>
      <HoverCard.Content
        bg="background.base"
        gap="md"
        minWidth={['100px']}
        px="0"
        py="ms"
        shadow="3xl"
      >
        <Stack gap="sm" px="sm" w="full">
          <Text color="font.secondary" fontSize="sm">
            {`Weekly bribes are provided by unaffiliated 3rd parties through the Votemarket platform
            to incentivize liquidity to certain pools. This does not include additional yield that veBAL
            holders also can earn (e.g. protocol revenue, extra boosts on liquidity mining incentives,
            and swap fees).`}
          </Text>
        </Stack>
      </HoverCard.Content>
    </HoverCard.Positioner>
  )

  return (
    <HoverCard.Root>
      <>
        <HoverCard.Trigger asChild>
          <Icon
            as={StarsIcon}
            gradFrom={system.token('colors.red.400', '#FC8181')}
            gradTo={system.token('colors.red.400', '#FC8181')}
          />
        </HoverCard.Trigger>

        {popoverContent}
      </>
    </HoverCard.Root>
  )
}
