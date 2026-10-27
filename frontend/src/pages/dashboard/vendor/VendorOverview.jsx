import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { DashTitle } from '../DashboardLayout'
import StoreStatusBanner from './StoreStatusBanner'
import { Loader, ErrorBox, StatCard, StatusBadge, SuccessBox } from '../../../components/common/ui'
import { useFetchMyStoreQuery, useFetchMyStoreStatsQuery } from '../../../redux/features/stores/storesApi'
import { formatDate, formatPrice } from '../../../utils/format'

// tiny bar chart of daily sales over the last 30 days
const SalesChart = ({ data = [] }) => {
  const days = [...Array(30)].map((_, i) => {
    const d = new Date(Date.now() - (29 - i) * 864e5).toISOString().slice(0, 10)
    return { day: d, revenue: data.find((x) => x._id === d)?.revenue || 0 }
  })
  const max = Math.max(...days.map((d) => d.revenue), 1)
  return (
    <div>
      <div className='flex h-32 items-end gap-1'>
        {days.map((d) => (
          <div key={d.day} title={`${formatDate(d.day)}: ${formatPrice(d.revenue)}`}
            className='flex-1 rounded-t bg-primary/80 hover:bg-primary'
            style={{ height: `${Math.max((d.revenue / max) * 100, d.revenue ? 4 : 1)}%`, opacity: d.revenue ? 1 : 0.25 }} />
        ))}
      </div>
      <div className='mt-1 flex justify-between text-xs text-text-light'><span>30 days ago</span><span>Today</span></div>
    </div>
  )
}

const VendorOverview = () => {
  const location = useLocation()
  const { data: mine, isLoading, error } = useFetchMyStoreQuery()
  const { data: stats } = useFetchMyStoreStatsQuery()

  if (isLoading) return <Loader />
  if (error) {
    return (
      <ErrorBox>
        You don't have a store yet. <Link to='/sell' className='underline'>Open one</Link>
      </ErrorBox>
    )
  }

  const { store, productCount } = mine
  const plan = store.subscription.plan

  return (
    <>
      {location.state?.message && <div className='mb-6'><SuccessBox>{location.state.message}</SuccessBox></div>}
      <StoreStatusBanner store={store} />
      <DashTitle title={store.name} action={
        <div className='flex gap-2'>
          <StatusBadge status={mine.isOpen ? 'active' : store.status === 'active' ? 'overdue' : store.status} label={mine.isOpen ? 'Open' : undefined} />
          <Link to='/dashboard/store/products/new' className='btn text-sm'><i className='ri-add-line'></i> Add product</Link>
        </div>
      }>
        {plan.name} plan · rent paid until {formatDate(store.subscription.currentPeriodEnd)}
      </DashTitle>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard icon='ri-money-dollar-circle-line' label='Sales (excl. VAT)' value={formatPrice(stats?.revenue)} />
        <StatCard icon='ri-file-list-3-line' label='Orders' value={stats?.orders ?? '–'} hint={stats ? `${stats.pendingOrders} to ship` : ''} />
        <StatCard icon='ri-shopping-bag-3-line' label='Products' value={`${productCount} / ${plan.productLimit}`} hint={stats?.lowStock ? `${stats.lowStock} low on stock` : 'Plan limit'} />
        <StatCard icon='ri-calendar-line' label='Rent due' value={formatDate(store.subscription.currentPeriodEnd)} hint={`${plan.name} · ${formatPrice(plan.priceMonthly)}/month`} />
      </div>

      <div className='mt-6 grid gap-6 lg:grid-cols-3'>
        <div className='rounded-lg border bg-white p-5 lg:col-span-2'>
          <h3 className='mb-4 font-semibold'>Sales, last 30 days</h3>
          <SalesChart data={stats?.salesByDay} />
        </div>
        <div className='rounded-lg border bg-white p-5'>
          <div className='mb-3 flex items-center justify-between'>
            <h3 className='font-semibold'>Latest orders</h3>
            <Link to='/dashboard/store/orders' className='text-sm text-primary'>See all</Link>
          </div>
          {!stats?.recentOrders?.length ? <p className='text-sm text-text-light'>No orders yet.</p> : (
            <ul className='space-y-3'>
              {stats.recentOrders.map((o) => (
                <li key={o._id} className='flex items-center justify-between text-sm'>
                  <div>
                    <p className='font-medium'>{o.customer?.username}</p>
                    <p className='text-xs text-text-light'>{formatDate(o.createdAt)}</p>
                  </div>
                  <div className='text-right'>
                    <p>{formatPrice(o.subtotal)}</p>
                    <StatusBadge status={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {productCount === 0 && (
        <div className='mt-6 rounded-lg border-2 border-dashed p-8 text-center'>
          <i className='ri-upload-cloud-2-line text-4xl text-primary'></i>
          <h3 className='mt-2 font-semibold'>Add your first product</h3>
          <p className='text-sm text-text-light'>Upload a photo, set a price and you're ready to sell.</p>
          <Link to='/dashboard/store/products/new' className='btn mt-4 inline-block'>Add product</Link>
        </div>
      )}
    </>
  )
}

export default VendorOverview
