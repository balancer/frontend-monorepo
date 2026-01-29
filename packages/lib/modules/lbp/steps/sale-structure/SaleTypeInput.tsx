import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react'
import { RadioCardGroup, RadioCardOption } from '@repo/lib/shared/components/inputs/RadioCardGroup'
import { Control, Controller } from 'react-hook-form'
import { SaleStructureForm, SaleType } from '../../lbp.types'
import { Minus, TrendingUp } from 'react-feather'
import { ReactNode } from 'react'

const saleTypeOptions: RadioCardOption<SaleType>[] = [
  {
    value: SaleType.DYNAMIC_PRICE_LBP,
    label: (
      <HStack align="start" spacing="md" w="full">
        <IconBadge icon={<TrendingUp size={20} />} />
        <VStack align="start" spacing="xs" w="full">
          <Text fontWeight="bold">Dynamic price LBP</Text>
          <Text color="font.secondary" fontSize="sm">
            A dynamic token sale mechanism where the token price fluctuates based on supply and
            demand, allowing for fair price discovery and minimizing front-running by large buyers.
          </Text>
        </VStack>
      </HStack>
    ),
  },
  {
    value: SaleType.FIXED_PRICE_LBP,
    label: (
      <HStack align="start" spacing="md" w="full">
        <IconBadge icon={<Minus size={20} />} />
        <VStack align="start" spacing="xs" w="full">
          <HStack spacing="sm">
            <Text fontWeight="bold">Fixed price LBP</Text>
            <Badge colorScheme="yellow" variant="solid">
              New
            </Badge>
          </HStack>
          <Text color="font.secondary" fontSize="sm">
            A token sale where all participants purchase tokens at a set price, ensuring consistency
            throughout the sale. Ideal for projects seeking predictable fundraising.
          </Text>
        </VStack>
      </HStack>
    ),
  },
]

export function SaleTypeInput({ control }: { control: Control<SaleStructureForm> }) {
  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Sale type</Text>
      <Controller
        control={control}
        name="saleType"
        render={({ field }) => (
          <RadioCardGroup
            layoutProps={{ columns: 1, spacing: 'md' }}
            name={field.name}
            onChange={field.onChange}
            options={saleTypeOptions}
            radioCardProps={{
              containerProps: {
                bg: 'background.level2',
                borderColor: 'transparent',
                borderRadius: 'lg',
                borderWidth: '1px',
                boxShadow: 'md',
                px: 4,
                py: 4,
                _checked: {
                  bg: '#63F2BE0D',
                  borderColor: 'green.400 !important',
                  boxShadow: 'none',
                },
                _hover: {
                  boxShadow: 'lg',
                },
              },
              wrapperProps: {
                w: 'full',
              },
            }}
            value={field.value}
          />
        )}
      />
    </VStack>
  )
}

function IconBadge({ icon }: { icon: ReactNode }) {
  return (
    <Box
      alignItems="center"
      bg="background.level4"
      borderRadius="md"
      color="font.secondary"
      display="flex"
      h="56px"
      justifyContent="center"
      minW="56px"
      w="56px"
    >
      {icon}
    </Box>
  )
}
