import React from 'react'
import { Link } from 'react-router-dom'
import { DashTitle } from '../DashboardLayout'
import OrderCard from '../OrderCard'
import { Loader, ErrorBox, EmptyState } from '../../../components/common/ui'
import { useFetchMyOrdersQuery } from '../../../redux/features/orders/ordersApi'

const MyOrders = () => {
  const { data: orders = [], isLoading, error } = useFetchMyOrdersQuery()

  return (
    <>
      <DashTitle title='My purchases'>Orders from stores in the mall. Each store ships its own items.</DashTitle>
      {isLoading ? <Loader /> : error ? <ErrorBox>Could not load your orders.</ErrorBox> :
        orders.length === 0
          ? <EmptyState icon='ri-shopping-cart-line' title='No orders yet'><Link to='/shop' className='text-primary underline'>Start shopping</Link></EmptyState>
          : <div className='space-y-3'>{orders.map((o) => <OrderCard key={o._id} order={o} />)}</div>}
    </>
  )
}

export default MyOrders
