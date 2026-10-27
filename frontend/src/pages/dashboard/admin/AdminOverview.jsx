import React from 'react'
import { Link } from 'react-router-dom'
import { DashTitle } from '../DashboardLayout'
import { Loader, ErrorBox, StatCard } from '../../../components/common/ui'
import { useFetchAdminStatsQuery, useUpdateStoreStatusMutation } from '../../../redux/features/admin/adminApi'
import { formatDate, formatPrice } from '../../../utils/format'

const AdminOverview = () => {
  const { data: s, isLoading, error } = useFetchAdminStatsQuery()
  const [updateStatus, { isLoading: saving }] = useUpdateStoreStatusMutation()

  if (isLoading) return <Loader />
  if (error) return <ErrorBox>Could not load mall statistics.</ErrorBox>

  return (
    <>
      <DashTitle title='Mall overview'>How Mamoa Mall is doing.</DashTitle>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard icon='ri-store-2-line' label='Open stores' value={s.stores.active - s.stores.overdue}
          hint={`${s.stores.pending} pending · ${s.stores.overdue} rent overdue · ${s.stores.suspended} suspended`} />
        <StatCard icon='ri-bank-card-line' label='Rent collected (30 days)' value={formatPrice(s.rentLast30Days)} hint={`${formatPrice(s.rentCollected)} all time`} />
        <StatCard icon='ri-shopping-cart-line' label='Sales through the mall' value={formatPrice(s.mallSales)} hint={`${s.orders} orders`} />
        <StatCard icon='ri-team-line' label='People' value={s.shoppers + s.vendors} hint={`${s.shoppers} shoppers · ${s.vendors} store owners · ${s.products} products`} />
      </div>

      <div className='mt-8 rounded-lg border bg-white p-5'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='font-semibold'>Stores waiting for approval</h3>
          <Link to='/dashboard/admin/stores?status=pending' className='text-sm text-primary'>See all</Link>
        </div>
        {s.pendingStores.length === 0 ? <p className='text-sm text-text-light'>Nothing waiting. 🎉</p> : (
          <ul className='divide-y'>
            {s.pendingStores.map((st) => (
              <li key={st._id} className='flex flex-wrap items-center justify-between gap-3 py-3'>
                <div>
                  <p className='font-medium'>{st.name} <span className='text-xs capitalize text-text-light'>· {st.category}</span></p>
                  <p className='text-xs text-text-light'>{st.owner?.username} ({st.owner?.email}) · {st.subscription?.plan?.name} plan · applied {formatDate(st.createdAt)}</p>
                </div>
                <div className='flex gap-2'>
                  <button disabled={saving} onClick={() => updateStatus({ id: st._id, status: 'active' })}
                    className='rounded-md bg-green-600 px-4 py-1.5 text-sm text-white hover:bg-green-700'>Approve</button>
                  <button disabled={saving} onClick={() => {
                    const note = window.prompt('Reason for rejecting (shown to the store owner):')
                    if (note !== null) updateStatus({ id: st._id, status: 'rejected', note })
                  }} className='rounded-md border px-4 py-1.5 text-sm hover:bg-gray-50'>Reject</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

export default AdminOverview
