import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useFetchCheckoutQuery } from '../../redux/features/orders/ordersApi'
import { Loader, ErrorBox } from '../../components/common/ui'
import { formatPrice } from '../../utils/format'

const OrderSuccess = () => {
  const { checkoutId } = useParams()
  const { data: orders = [], isLoading, error } = useFetchCheckoutQuery(checkoutId)

  if (isLoading) return <Loader />
  if (error) return <div className='section__container'><ErrorBox>We couldn't find that order.</ErrorBox></div>

  const total = orders.reduce((s, o) => s + o.total, 0)

  return (
    <section className='section__container max-w-2xl text-center'>
      <i className='ri-checkbox-circle-fill text-6xl text-green-600'></i>
      <h2 className='section__header mt-2'>Thank you for your order!</h2>
      <p className='text-text-light'>
        Payment of <b>{formatPrice(total)}</b> received (ref {orders[0]?.payment?.reference}).
        {orders.length > 1 && ` Your items come from ${orders.length} stores, so you have ${orders.length} orders.`}
      </p>

      <div className='mt-8 space-y-4 text-left'>
        {orders.map((o) => (
          <div key={o._id} className='rounded-lg border p-4'>
            <div className='mb-2 flex justify-between text-sm'>
              <span className='font-semibold'>{o.store?.name}</span>
              <span className='text-text-light'>Order {o.orderNumber}</span>
            </div>
            {o.items.map((i) => (
              <div key={i.product} className='flex justify-between text-sm'>
                <span>{i.quantity} × {i.name}</span><span>{formatPrice(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className='mt-8 flex justify-center gap-3'>
        <Link to='/dashboard/orders' className='btn inline-block'>Track my orders</Link>
        <Link to='/shop' className='inline-block rounded-md border px-6 py-3'>Keep shopping</Link>
      </div>
    </section>
  )
}

export default OrderSuccess
