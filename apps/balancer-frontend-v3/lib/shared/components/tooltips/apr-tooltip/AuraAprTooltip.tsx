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
import { bn, fNum } from '@/lib/shared/utils/numbers'
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
    <PopoverContent w="fit-content" shadow="3xl" minWidth={['100px', '300px']} p="0">
      <TooltipAprItem
        {...basePopoverAprItemProps}
        displayValueFormatter={usedDisplayValueFormatter}
        pt={3}
        title="Aura APR"
        apr={bn(auraApr)}
        aprOpacity={auraApr ? 1 : 0.5}
        bg="background.level3"
        tooltipText="Visit Aura to get a full breakdown of this current APR and the projected APR for next week."
      />
      <Divider />
      <TooltipAprItem
        {...basePopoverAprItemProps}
        displayValueFormatter={usedDisplayValueFormatter}
        pt={3}
        backgroundColor="background.level4"
        fontColor="font.maxContrast"
        title="Total APR"
        apr={bn(auraApr)}
      />
    </PopoverContent>
  )

  return (
    <Popover trigger="hover">
      {({ isOpen }) => (
        <>
          <PopoverTrigger>
            <HStack align="center" alignItems="center">
              <Button variant="unstyled" _focus={{ outline: 'none' }} px="0">
                <HStack
                  // _hover={{ color: hoverColor }}
                  color={'font.primary'}
                  opacity={1}
                >
                  <Text textAlign="right" color={'font.primary'}>
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
