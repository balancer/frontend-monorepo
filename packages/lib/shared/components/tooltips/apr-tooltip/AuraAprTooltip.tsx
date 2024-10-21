import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Divider,
  HStack,
  Button,
  Text,
  Icon,
  useTheme,
  Portal,
} from '@chakra-ui/react'
import { TooltipAprItem } from './TooltipAprItem'
import BigNumber from 'bignumber.js'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import StarsIcon from '../../icons/StarsIcon'

interface Props {
  auraApr: number
}

const basePopoverAprItemProps = {
  pl: 2,
  pr: 2,
  pb: 3,
  backgroundColor: 'background.level1',
  fontWeight: 700,
}

const defaultDisplayValueFormatter = (value: BigNumber) => fNum('apr', value.toString())

function AuraAprTooltip({ auraApr }: Props) {
  const theme = useTheme()

  const usedDisplayValueFormatter = defaultDisplayValueFormatter

  const popoverContent = (
    <PopoverContent minWidth={['100px', '300px']} p="0" shadow="3xl" w="fit-content">
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
      <Divider />
      <TooltipAprItem
        {...basePopoverAprItemProps}
        apr={bn(auraApr)}
        backgroundColor="background.level4"
        displayValueFormatter={usedDisplayValueFormatter}
        fontColor="font.maxContrast"
        pt={3}
        title="Total APR"
      />
    </PopoverContent>
  )

  return (
    <Popover trigger="hover">
      {({ isOpen }) => (
        <>
          <PopoverTrigger>
            <HStack align="center" alignItems="center">
              <Button _focus={{ outline: 'none' }} px="0" variant="unstyled">
                <HStack
                  // _hover={{ color: hoverColor }}
                  color="font.primary"
                  opacity={1}
                >
                  <Text color="font.primary" textAlign="right">
                    {usedDisplayValueFormatter(bn(auraApr))}
                  </Text>
                  <Icon
                    as={StarsIcon}
                    gradFrom={isOpen ? 'green' : theme.colors.sparkles.default.from}
                    gradTo={isOpen ? 'green' : theme.colors.sparkles.default.to}
                  />
                </HStack>
              </Button>
            </HStack>
          </PopoverTrigger>

          <Portal>{popoverContent}</Portal>
        </>
      )}
    </Popover>
  )
}

export type { Props as BaseAprTooltipProps }
export default AuraAprTooltip
