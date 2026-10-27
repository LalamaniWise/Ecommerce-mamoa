import React, { useState } from 'react'
import { DashTitle } from '../DashboardLayout'
import OrderCard from '../OrderCard'
import { Loader, ErrorBox, EmptyState } from '../../../components/common/ui'
import { useFetchStoreOrdersQuery, useUpdateOrderStatusMutation } from '../../../redux/features/orders/ordersApi'
import { errorMessage } from '../../../utils/format'

const nextActions = {
  paid: [{ status: 'processing', label: 'Start packing' }, { status: 'shipped', label: 'Mark shipped' }, { status: 'cancelled', label: 'Cancel order', danger: true }],
  processing: [{ status: 'shipped', label: 'Mark shipped' }, { status: 'cancelled', label: 'Cancel order', danger: true }],
  shipped: [{ status: 'delivered', label: 'Mark delivered' }],
}

const tabs = ['all', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

export const OrderActions = ({ order }) => {
  const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation()
  const [err, setErr] = useState('')
  const actions = nextActions[order.status] || []
  if (!actions.length) return null

  const run = async (a) => {
    if (a.danger && !window.confirm('Cancel this order? Stock will be returned to your store.')) return
    setErr('')
    try { await updateStatus({ id: order._id, status: a.status }).unwrap() } catch (e) { setErr(errorMessage(e)) }
  }

  return (
    <div className='flex flex-wrap items-center gap-2 border-t pt-4'>
      {actions.map((a) => (
        <button key={a.status} disabled={isLoading} onClick={() => run(a)}
          className={`rounded-md px-4 py-2 text-sm ${a.danger ? 'border border-red-300 text-red-700 hover:bg-red-50' : 'bg-primary text-white hover:bg-primary-dark'} disabled:opacity-50`}>
          {a.label}
        </button>
      ))}
      {err && <span className='text-sm text-red-600'>{err}</span>}
    </div>
  )
}

const VendorOrders = () => {
  const [tab, setTab] = useState('all')
  const { data: orders = [], isLoading, error } = useFetchStoreOrdersQuery(tab === 'all' ? {} : { status: tab })

  return (
    <>
      <DashTitle title='Orders'>Orders for your store. Pack and ship them, then update the status so the shopper can follow along.</DashTitle>
      <div className='mb-4 flex flex-wrap gap-2'>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize ${tab === t ? 'bg-primary text-white' : 'bg-white border hover:bg-gray-50'}`}>
            {t === 'paid' ? 'new' : t}
          </button>
        ))}
      </div>
      {isLoading ? <Loader /> : error ? <ErrorBox>{errorMessage(error)}</ErrorBox> :
        orders.length === 0 ? <EmptyState icon='ri-file-list-3-line' title='No orders here yet' /> :
          <div className='space-y-3'>
            {orders.map((o) => <OrderCard key={o._id} order={o} showStore={false} showCustomer actions={<OrderActions order={o} />} />)}
          </div>}
    </>
  )
}

export default VendorOrders
