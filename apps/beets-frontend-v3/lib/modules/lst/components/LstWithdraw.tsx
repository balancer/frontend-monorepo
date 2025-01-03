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
import { UserWithdraw } from '../hooks/useGetUserWithdraws'

export function LstWithdraw({
  withdrawalsData,
  isLoading,
}: {
  withdrawalsData: UserWithdraw[]
  isLoading: boolean
}) {
  const { stakedAsset, pagination, setPagination, first, skip, chain } = useLst()
  const { isOpen, onOpen, onClose } = useDisclosure()

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
