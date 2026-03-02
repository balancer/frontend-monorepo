import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react'
import { RadioCardGroup, RadioCardOption } from '@repo/lib/shared/components/inputs/RadioCardGroup'
import { Control, Controller } from 'react-hook-form'
import { SaleStructureForm, SaleTypeOptionValue } from '../../lbp.types'
import { Minus, TrendingUp } from 'react-feather'
import { ReactNode } from 'react'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'

const saleTypeOptions: RadioCardOption<SaleTypeOptionValue>[] = [
  {
    value: GqlPoolType.LiquidityBootstrapping,
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
    value: GqlPoolType.FixedLbp,
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
                _checked: {
                  borderColor: 'green.400 !important',
                  bg: '#63F2BE0D',
                  color: 'font.opposite',
                },
                _focus: {
                  boxShadow: 'outline',
                },
                _hover: {
                  borderColor: 'green.400',
                },
                borderColor: 'transparent',
                borderRadius: 'lg',
                borderWidth: '1px',
                boxShadow: 'md',
                bg: 'background.level2',
                cursor: 'pointer',
                px: 4,
                py: 4,
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
