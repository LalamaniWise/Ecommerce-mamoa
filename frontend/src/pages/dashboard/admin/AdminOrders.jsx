import React, { useState } from 'react'
import { DashTitle } from '../DashboardLayout'
import OrderCard from '../OrderCard'
import { OrderActions } from '../vendor/VendorOrders'
import { Loader, ErrorBox, EmptyState } from '../../../components/common/ui'
import { useFetchAllOrdersQuery } from '../../../redux/features/orders/ordersApi'
import { errorMessage } from '../../../utils/format'

const tabs = ['all', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

const AdminOrders = () => {
  const [tab, setTab] = useState('all')
  const { data: orders = [], isLoading, error } = useFetchAllOrdersQuery(tab === 'all' ? {} : { status: tab })

  return (
    <>
      <DashTitle title='All orders'>Every order across the mall (latest 200). You can step in on any order if a store needs help.</DashTitle>
      <div className='mb-4 flex flex-wrap gap-2'>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize ${tab === t ? 'bg-primary text-white' : 'border bg-white hover:bg-gray-50'}`}>{t}</button>
        ))}
      </div>
      {isLoading ? <Loader /> : error ? <ErrorBox>{errorMessage(error)}</ErrorBox> :
        orders.length === 0 ? <EmptyState icon='ri-file-list-3-line' title='No orders' /> :
          <div className='space-y-3'>
            {orders.map((o) => <OrderCard key={o._id} order={o} showCustomer actions={<OrderActions order={o} />} />)}
          </div>}
    </>
  )
}

export default AdminOrders
