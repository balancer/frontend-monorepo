import { HoverCard, HStack, Button, Heading, Text, Icon, Portal, Separator } from '@chakra-ui/react'
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { TooltipAprItem } from './TooltipAprItem'
import BigNumber from 'bignumber.js'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import StarsIcon from '../../icons/StarsIcon'

interface Props {
  auraApr: number
  textProps?: { fontWeight?: string }
}

const basePopoverAprItemProps = {
  pl: 2,
  pr: 2,
  pb: 3,
  backgroundColor: 'background.level1',
  fontWeight: 700,
}

const defaultDisplayValueFormatter = (value: BigNumber) => fNum('apr', value.toString())

function AuraAprTooltip({ auraApr, textProps }: Props) {
  const usedDisplayValueFormatter = defaultDisplayValueFormatter

  const colorMode = useThemeColorMode()
  const auraGradFrom = colorMode === 'dark' ? '#9357FF' : '#9357FF'
  const auraGradTo = colorMode === 'dark' ? '#E9CCFF' : '#D399FF'

  const popoverContent = (
    <HoverCard.Positioner>
      <HoverCard.Content minWidth={['100px', '300px']} p="0" shadow="3xl" w="fit-content">
        <TooltipAprItem
          {...basePopoverAprItemProps}
          apr={bn(auraApr)}
          aprOpacity={auraApr ? 1 : 0.5}
          bg="background.level3"
          displayValueFormatter={usedDisplayValueFormatter}
          pt={3}
          title="Aura APR"
          tooltipText="Visit Aura to get a full breakdown of this current APR and the projected APR for next week."
        />
        <Separator />
        <TooltipAprItem
          {...basePopoverAprItemProps}
          apr={bn(auraApr)}
          backgroundColor="background.level4"
          displayValueFormatter={usedDisplayValueFormatter}
          fontColor="font.maxContrast"
          pt={3}
          title="Total APR"
        />
      </HoverCard.Content>
    </HoverCard.Positioner>
  )

  return (
    <HoverCard.Root>
      <HoverCard.Context>
        {({ open: isOpen }: { open: boolean }) => (
          <>
            <HoverCard.Trigger asChild>
              <HStack align="center" alignItems="center">
                <Button _focus={{ outline: 'none' }} h="30px" px="0" unstyled>
                  <HStack
                    // _hover={{ color: hoverColor }}
                    color="font.primary"
                    gap="xs"
                    opacity={1}
                  >
                    {textProps ? (
                      <Text {...textProps}>{usedDisplayValueFormatter(bn(auraApr))}</Text>
                    ) : (
                      <Heading cursor="pointer" size="h4">
                        {usedDisplayValueFormatter(bn(auraApr))}
                      </Heading>
                    )}
                    <Icon
                      asChild
                      gradFrom={isOpen ? 'green' : auraGradFrom}
                      gradTo={isOpen ? 'green' : auraGradTo}
                      variant="gradient"
                    >
                      <StarsIcon />
                    </Icon>
                  </HStack>
                </Button>
              </HStack>
            </HoverCard.Trigger>

            <Portal>{popoverContent}</Portal>
          </>
        )}
      </HoverCard.Context>
    </HoverCard.Root>
  )
}

export type { Props as BaseAprTooltipProps }
export default AuraAprTooltip
