import {
  Divider,
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import StarsIcon from '@repo/lib/shared/components/icons/StarsIcon'
import { TooltipItem } from './TooltipItem'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'

type Props = {
  totalIncentives: number
  protocolRevenueShare: number
}

const baseItemProps = {
  pl: 4,
  pr: 2,
  pb: 3,
  backgroundColor: 'background.level1',
  fontWeight: 700,
}

const rewardGradient =
   
  'linear-gradient(90deg, rgba(179, 174, 245, 0.5) 0%, rgba(215, 203, 231, 0.5) 25%, rgba(229, 200, 200, 0.5) 50%, rgba(234, 168, 121, 0.5) 100%)'

export function IncentivesOptimizedTooltip({ totalIncentives, protocolRevenueShare }: Props) {
  const { toCurrency } = useCurrency()

  const gradColorFrom = useColorModeValue(
    '#F49A55', // light from
    '#F49175' // dark from
  )
  const gradColorTo = useColorModeValue(
    '#FCD45B', // light to
    '#FFCC33' // dark to
  )

  const currencyFormatter = (value: number) => toCurrency(value, { abbreviated: false })

  return (
    <Popover isLazy trigger="hover">
      <>
        <PopoverTrigger>
          <Icon as={StarsIcon} gradFrom={gradColorFrom} gradTo={gradColorTo} />
        </PopoverTrigger>

        <Portal>
          <PopoverContent
            minWidth={['100px', '300px']}
            motionProps={{ animate: { scale: 1, opacity: 1 } }}
            overflow="hidden"
            p="0"
            shadow="3xl"
            w="fit-content"
          >
            <Stack gap={0} roundedBottom="md">
              <TooltipItem
                pt={3}
                {...baseItemProps}
                displayValueFormatter={currencyFormatter}
                title="Protocol revenue share"
                tooltipText=""
                value={protocolRevenueShare}
              />
              <TooltipItem
                {...baseItemProps}
                displayValueFormatter={currencyFormatter}
                title="Potential bribes"
                tooltipText=""
                value={totalIncentives}
              />
              <Divider />
              <TooltipItem
                {...baseItemProps}
                backgroundColor={rewardGradient}
                displayValueFormatter={currencyFormatter}
                fontColor="font.special"
                pt={3}
                px={2}
                roundedBottom="md"
                textBackground="background.special"
                textBackgroundClip="text"
                title="Total with votes optimized"
                value={protocolRevenueShare + totalIncentives}
              />

              <Divider />

              <Stack backgroundColor="background.level1">
                <Text fontSize="sm" maxWidth={300} pb="3" pl="4" pr="2" pt="3" variant="secondary">
                  Note: In addition, veBAL holders earn extra BAL incentives when they LP in
                  eligible pools (based on veBAL pools)
                </Text>
              </Stack>
            </Stack>
          </PopoverContent>
        </Portal>
      </>
    </Popover>
  )
}
