import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../../components/common/ui'
import { formatDate, formatPrice } from '../../utils/format'

const steps = ['paid', 'processing', 'shipped', 'delivered']

// One order. `actions` lets store owners change its status.
const OrderCard = ({ order, showStore = true, showCustomer = false, actions }) => {
  const [open, setOpen] = useState(false)
  const stepIndex = steps.indexOf(order.status)

  return (
    <div className='rounded-lg border bg-white'>
      <button onClick={() => setOpen(!open)} className='flex w-full flex-wrap items-center gap-x-6 gap-y-2 p-4 text-left'>
        <div className='min-w-[9rem]'>
          <p className='text-xs text-text-light'>Order</p>
          <p className='font-mono text-sm font-semibold'>{order.orderNumber}</p>
        </div>
        <div>
          <p className='text-xs text-text-light'>Date</p>
          <p className='text-sm'>{formatDate(order.createdAt)}</p>
        </div>
        {showStore && order.store && (
          <div>
            <p className='text-xs text-text-light'>Store</p>
            <p className='text-sm'>{order.store.name}</p>
          </div>
        )}
        {showCustomer && order.customer && (
          <div>
            <p className='text-xs text-text-light'>Customer</p>
            <p className='text-sm'>{order.customer.username}</p>
          </div>
        )}
        <div>
          <p className='text-xs text-text-light'>Total</p>
          <p className='text-sm font-semibold'>{formatPrice(order.total)}</p>
        </div>
        <div className='ml-auto flex items-center gap-3'>
          <StatusBadge status={order.status} />
          <i className={open ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}></i>
        </div>
      </button>

      {open && (
        <div className='border-t p-4 space-y-4'>
          {order.status !== 'cancelled' && (
            <div className='flex items-center gap-2'>
              {steps.map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-1 text-xs capitalize ${i <= stepIndex ? 'text-green-700 font-semibold' : 'text-text-light'}`}>
                    <i className={i <= stepIndex ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'}></i>{s}
                  </div>
                  {i < steps.length - 1 && <div className={`h-px flex-1 ${i < stepIndex ? 'bg-green-600' : 'bg-gray-200'}`}></div>}
                </React.Fragment>
              ))}
            </div>
          )}

          <div className='space-y-2'>
            {order.items.map((i) => (
              <div key={i.product} className='flex items-center gap-3'>
                <img src={i.image} alt='' className='size-12 rounded object-cover' />
                <Link to={`/shop/${i.product}`} className='flex-1 text-sm hover:text-primary'>{i.name}</Link>
                <span className='text-sm text-text-light'>{i.quantity} × {formatPrice(i.price)}</span>
              </div>
            ))}
          </div>

          <div className='grid gap-4 text-sm sm:grid-cols-2'>
            <div>
              <p className='font-semibold'>Deliver to</p>
              <p className='text-text-light'>
                {order.shippingAddress?.fullName}, {order.shippingAddress?.phone}<br />
                {order.shippingAddress?.street}, {order.shippingAddress?.city}<br />
                {order.shippingAddress?.province} {order.shippingAddress?.postalCode}
              </p>
            </div>
            <div className='sm:text-right'>
              <p>Subtotal: {formatPrice(order.subtotal)}</p>
              <p>VAT: {formatPrice(order.tax)}</p>
              <p className='font-semibold'>Total: {formatPrice(order.total)}</p>
              <p className='text-xs text-text-light'>Paid with card •••• {order.payment?.cardLast4} ({order.payment?.reference})</p>
            </div>
          </div>

          {actions}
        </div>
      )}
    </div>
  )
}

export default OrderCard
