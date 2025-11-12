import { ReactNode, Ref } from 'react'
import {
  Box,
  BoxProps,
  Card,
  CardProps,
  Divider,
  Grid,
  GridItem,
  GridItemProps,
  GridProps,
  Heading,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react'

export type PoolTransactionsCardHeaderCell = {
  label: string
  textAlign?: GridItemProps['textAlign']
  marginRight?: GridItemProps['mr']
}

export type PoolTransactionsCardProps = {
  title: string
  isLoading: boolean
  headerCells?: PoolTransactionsCardHeaderCell[]
  headerTemplateColumns: string
  hasNoTransactions: boolean
  renderNoTransactions?: () => ReactNode
  children: ReactNode
  footer?: ReactNode
  cardProps?: CardProps
  cardRef?: Ref<HTMLDivElement>
  listContainerProps?: BoxProps
  headerGridProps?: GridProps
  contentAlignItems?: BoxProps['alignItems']
}

const DEFAULT_HEADER_CELLS: PoolTransactionsCardHeaderCell[] = [
  { label: 'Action', textAlign: 'left' },
  { label: 'Tokens', textAlign: 'left' },
  { label: 'Value', textAlign: 'right' },
  { label: 'Time', textAlign: 'right', marginRight: 'md' },
]

const DEFAULT_NO_TRANSACTIONS_STATE = (
  <VStack alignItems="flex-start" spacing="1">
    <Text variant="secondary">No recent transactions</Text>
    <Text variant="secondary">
      Note: Recent transactions may take a few minutes to display here.
    </Text>
  </VStack>
)

export function PoolTransactionsCard({
  title,
  isLoading,
  headerCells,
  headerTemplateColumns,
  hasNoTransactions,
  renderNoTransactions,
  children,
  footer,
  cardProps,
  cardRef,
  listContainerProps,
  headerGridProps,
  contentAlignItems = 'flex-start',
}: PoolTransactionsCardProps) {
  const cells = headerCells ?? DEFAULT_HEADER_CELLS
  const noTransactionsState = renderNoTransactions ?? DEFAULT_NO_TRANSACTIONS_STATE

  return (
    <Card ref={cardRef} {...cardProps}>
      {isLoading ? (
        <Skeleton h="full" w="full" />
      ) : (
        <Box
          alignItems={contentAlignItems}
          display="flex"
          flexDirection="column"
          gap="md"
          h="full"
          w="full"
        >
          <Heading
            backgroundClip="text"
            bg="font.special"
            fontWeight="bold"
            lineHeight="34px"
            size="h5"
          >
            {title}
          </Heading>
          <Divider />
          <Box display={{ base: 'none', md: 'block' }} w="full">
            <Grid
              gap="4"
              templateColumns={{ base: '1fr', md: headerTemplateColumns }}
              w="full"
              {...headerGridProps}
            >
              {cells.map(({ label, textAlign, marginRight }) => (
                <GridItem key={label} mr={marginRight} textAlign={textAlign}>
                  <Text fontSize="0.85rem" fontWeight="medium" variant="secondary">
                    {label}
                  </Text>
                </GridItem>
              ))}
            </Grid>
            <Divider mt="md" />
          </Box>
          <Box overflowY="auto" w="full" {...listContainerProps}>
            {hasNoTransactions ? noTransactionsState : children}
          </Box>
          {footer}
        </Box>
      )}
    </Card>
  )
}
