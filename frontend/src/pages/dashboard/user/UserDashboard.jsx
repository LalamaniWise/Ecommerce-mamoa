import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { DashTitle } from '../DashboardLayout'
import OrderCard from '../OrderCard'
import { StatCard, Loader } from '../../../components/common/ui'
import { useFetchMyOrdersQuery } from '../../../redux/features/orders/ordersApi'
import { formatPrice } from '../../../utils/format'

const UserDashboard = () => {
  const { user } = useSelector((s) => s.auth)
  const { data: orders = [], isLoading } = useFetchMyOrdersQuery()
  const spent = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)
  const open = orders.filter((o) => ['paid', 'processing', 'shipped'].includes(o.status)).length

  return (
    <>
      <DashTitle title={`Hi, ${user.username.split(' ')[0]}`}>Here's what's happening with your orders.</DashTitle>
      <div className='grid gap-4 sm:grid-cols-3'>
        <StatCard icon='ri-shopping-cart-line' label='Orders' value={orders.length} />
        <StatCard icon='ri-truck-line' label='On the way' value={open} />
        <StatCard icon='ri-wallet-3-line' label='Total spent' value={formatPrice(spent)} />
      </div>

      <h3 className='mb-3 mt-8 font-semibold'>Recent orders</h3>
      {isLoading ? <Loader /> : orders.length === 0
        ? <p className='text-text-light'>No orders yet. <Link to='/shop' className='text-primary underline'>Start shopping</Link></p>
        : <div className='space-y-3'>{orders.slice(0, 5).map((o) => <OrderCard key={o._id} order={o} />)}</div>}

      <div className='mt-10 rounded-xl bg-text-dark p-6 text-white'>
        <h3 className='text-xl font-bold'>Have something to sell?</h3>
        <p className='mt-1 text-gray-300'>Rent a space in Mamoa Mall and open your own online store.</p>
        <Link to='/sell' className='btn mt-4 inline-block'>Open a store</Link>
      </div>
    </>
  )
}

export default UserDashboard
