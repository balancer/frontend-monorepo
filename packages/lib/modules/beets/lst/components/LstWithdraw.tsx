import { useLst } from '../LstProvider'
import { PaginatedTable } from '@repo/lib/shared/components/tables/PaginatedTable'
import { LstWithdrawTableRow } from './LstWithdrawTableRow'
import { LstWithdrawTableHeader } from './LstWithdrawTableHeader'
import { orderBy } from 'lodash'
import { getPaginationProps } from '@repo/lib/shared/components/pagination/getPaginationProps'
import { useEffect } from 'react'
import { useState } from 'react'

export function LstWithdraw() {
  const { stakedAsset, pagination, setPagination, first, skip } = useLst()

  const withdrawalsData = [
    {
      amountSftmx: '0.1',
      id: '1711618042230',
      isWithdrawn: false,
      requestTimestamp: 1711618053,
    },
    {
      amountSftmx: '0.1',
      id: '1710162573905',
      isWithdrawn: false,
      requestTimestamp: 1710162575,
    },
    {
      amountSftmx: '1',
      id: '1725187575341',
      isWithdrawn: false,
      requestTimestamp: 1725187576,
    },
    {
      amountSftmx: '0.1',
      id: '1728364914420',
      isWithdrawn: false,
      requestTimestamp: 1728364922,
    },
    {
      amountSftmx: '0.1',
      id: '1733745081753',
      isWithdrawn: false,
      requestTimestamp: 1733745109,
    },
    {
      amountSftmx: '0.1',
      id: '1733746230766',
      isWithdrawn: false,
      requestTimestamp: 1733746233,
    },
    {
      amountSftmx: '0.1',
      id: '1733745491083',
      isWithdrawn: false,
      requestTimestamp: 1733745586,
    },
    {
      amountSftmx: '0.1',
      id: '1733746260555',
      isWithdrawn: false,
      requestTimestamp: 1733746263,
    },
    {
      amountSftmx: '0.1',
      id: '1733740433907',
      isWithdrawn: false,
      requestTimestamp: 1733740450,
    },
    {
      amountSftmx: '0.1',
      id: '1704286751621',
      isWithdrawn: false,
      requestTimestamp: 1704286768,
    },
    {
      amountSftmx: '0.1',
      id: '1703753087133',
      isWithdrawn: false,
      requestTimestamp: 1703753087,
    },
    {
      amountSftmx: '0.1',
      id: '1703670165317',
      isWithdrawn: true,
      requestTimestamp: 1703670173,
    },
    {
      amountSftmx: '0.1',
      id: '1703670090970',
      isWithdrawn: true,
      requestTimestamp: 1703670097,
    },
    {
      amountSftmx: '0.1',
      id: '1704289055483',
      isWithdrawn: false,
      requestTimestamp: 1704289065,
    },
    {
      amountSftmx: '0.1',
      id: '1703668029605',
      isWithdrawn: true,
      requestTimestamp: 1703668034,
    },
    {
      amountSftmx: '0.8',
      id: '170265065707900000000',
      isWithdrawn: true,
      requestTimestamp: 1702650663,
    },
    {
      amountSftmx: '0.1',
      id: '170366651117500000000',
      isWithdrawn: true,
      requestTimestamp: 1703666512,
    },
  ]

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
  }, [skip])

  const rowProps = {
    px: { base: 'sm', sm: '0' },
    gridTemplateColumns: '100px 1fr 100px',
    alignItems: 'center',
    gap: { base: 'xxs', xl: 'lg' },
  }

  return (
    <PaginatedTable
      alignItems="flex-start"
      items={withdrawalsView}
      loading={false}
      noItemsFoundLabel="No requests found"
      paginationProps={paginationProps}
      renderTableHeader={() => <LstWithdrawTableHeader {...rowProps} />}
      renderTableRow={(withdrawal: any, index) => (
        <LstWithdrawTableRow
          keyValue={index}
          withdrawal={withdrawal}
          {...rowProps}
          token={stakedAsset}
        />
      )}
      showPagination={showPagination}
    />
  )
}
