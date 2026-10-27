import React from 'react'
import { DashTitle } from '../DashboardLayout'
import { Loader, ErrorBox } from '../../../components/common/ui'
import { useFetchAdminPaymentsQuery } from '../../../redux/features/admin/adminApi'
import { errorMessage, formatDate, formatPrice } from '../../../utils/format'

const AdminPayments = () => {
  const { data: payments = [], isLoading, error } = useFetchAdminPaymentsQuery()
  const total = payments.reduce((s, p) => s + p.amount, 0)

  return (
    <>
      <DashTitle title='Rent payments'>Monthly rent paid by stores (latest 200) — {formatPrice(total)} shown.</DashTitle>
      {isLoading ? <Loader /> : error ? <ErrorBox>{errorMessage(error)}</ErrorBox> : (
        <div className='overflow-x-auto rounded-lg border bg-white'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50 text-left text-text-light'>
              <tr><th className='p-3'>Date</th><th className='p-3'>Store</th><th className='p-3'>Plan</th><th className='p-3'>Period</th><th className='p-3'>Amount</th><th className='p-3'>Reference</th></tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className='border-t'>
                  <td className='p-3 whitespace-nowrap'>{formatDate(p.createdAt)}</td>
                  <td className='p-3'>{p.store?.name || '(deleted store)'}</td>
                  <td className='p-3'>{p.planName}</td>
                  <td className='p-3 whitespace-nowrap'>{formatDate(p.periodStart)} – {formatDate(p.periodEnd)}</td>
                  <td className='p-3'>{formatPrice(p.amount)}</td>
                  <td className='p-3 font-mono text-xs'>{p.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default AdminPayments
