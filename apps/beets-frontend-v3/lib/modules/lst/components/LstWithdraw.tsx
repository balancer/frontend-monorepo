import { useLst } from '../LstProvider'
import { PaginatedTable } from '@repo/lib/shared/components/tables/PaginatedTable'
import { LstWithdrawTableRow } from './LstWithdrawTableRow'
import { LstWithdrawTableHeader } from './LstWithdrawTableHeader'
import { orderBy } from 'lodash'
import { getPaginationProps } from '@repo/lib/shared/components/pagination/getPaginationProps'
import { useEffect } from 'react'
import { useState } from 'react'
import { LstWithdrawModal } from '../modals/LstWithdrawModal'
import { useDisclosure } from '@chakra-ui/react'
import { useGetUserWithdraws, UserWithdraw } from '../hooks/useGetUserWithdraws'
import { useGetUserNumWithdraws } from '../hooks/useGetUserNumWithdraws'

export function LstWithdraw() {
  const { stakedAsset, pagination, setPagination, first, skip, chain } = useLst()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { userNumWithdraws, isLoading: isUserNumWithdrawsLoading } = useGetUserNumWithdraws(chain)

  const { data: withdrawalsData, isLoading: isWithdrawalsLoading } = useGetUserWithdraws(
    chain,
    userNumWithdraws
  )

  console.log('withdraw')

  const isLoading = isWithdrawalsLoading || isUserNumWithdrawsLoading
  const withdrawalsDataOrdered = orderBy(withdrawalsData, 'requestTimestamp', 'desc')
  const count = withdrawalsDataOrdered.length
  const paginationProps = getPaginationProps(count || 0, pagination, setPagination, false, true)
  const showPagination = !!count && count > pagination.pageSize

  const [withdrawalsView, setWithdrawalsView] = useState(withdrawalsDataOrdered.slice(skip, first))

  useEffect(() => {
    if (withdrawalsDataOrdered.length < first) {
      setWithdrawalsView(withdrawalsDataOrdered.slice(skip))
    } else {
      setWithdrawalsView(withdrawalsDataOrdered.slice(skip, first + skip))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, withdrawalsData])

  const rowProps = {
    px: { base: 'sm', sm: '0' },
    gridTemplateColumns: '100px 1fr 100px',
    alignItems: 'center',
    gap: { base: 'xxs', xl: 'lg' },
  }

  return (
    <>
      <PaginatedTable
        alignItems="flex-start"
        getRowId={(withdrawal: UserWithdraw) =>
          `${withdrawal.requestTimestamp}-${withdrawal.validatorId}`
        }
        items={withdrawalsView}
        loading={isLoading}
        noItemsFoundLabel="No requests found"
        paginationProps={{ ...paginationProps, mt: 'auto' }}
        renderTableHeader={() => <LstWithdrawTableHeader {...rowProps} />}
        renderTableRow={(withdrawal: any, index) => (
          <LstWithdrawTableRow
            keyValue={index}
            withdrawal={withdrawal}
            {...rowProps}
            onOpen={onOpen}
            token={stakedAsset}
          />
        )}
        showPagination={showPagination}
      />
      <LstWithdrawModal chain={chain} isOpen={isOpen} onClose={onClose} />
    </>
  )
}
