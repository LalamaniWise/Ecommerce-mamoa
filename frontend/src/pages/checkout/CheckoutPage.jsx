import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useCheckoutMutation } from '../../redux/features/orders/ordersApi'
import { clearCart, groupByStore } from '../../redux/features/cart/cartSlice'
import CardFields from '../../components/common/CardFields'
import { ErrorBox, EmptyState, Field, PageHeader, inputClass } from '../../components/common/ui'
import { PROVINCES, errorMessage, formatPrice } from '../../utils/format'

const CheckoutPage = () => {
  const { products, totalPrice, tax, grandTotal } = useSelector((s) => s.cart)
  const { user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [checkout, { isLoading }] = useCheckoutMutation()
  const [error, setError] = useState('')
  const [address, setAddress] = useState({ fullName: user?.username || '', phone: user?.phone || '', street: '', city: '', province: 'Gauteng', postalCode: '' })
  const [card, setCard] = useState({ name: user?.username || '' })

  if (products.length === 0) {
    return (
      <EmptyState icon='ri-shopping-cart-line' title='Your cart is empty'>
        <Link to='/shop' className='text-primary underline'>Go shopping</Link>
      </EmptyState>
    )
  }

  const set = (key) => (e) => setAddress({ ...address, [key]: e.target.value })
  const groups = groupByStore(products)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await checkout({
        items: products.map((p) => ({ productId: p._id, quantity: p.quantity })),
        shippingAddress: address,
        card,
      }).unwrap()
      dispatch(clearCart())
      navigate(`/order-success/${res.checkoutId}`)
    } catch (err) {
      setError(errorMessage(err, 'Payment failed'))
      window.scrollTo(0, 0)
    }
  }

  return (
    <>
      <PageHeader title='Checkout'>One payment for everything in your cart. Each store ships its own items.</PageHeader>
      <form onSubmit={handleSubmit} className='section__container grid gap-10 lg:grid-cols-5'>
        <div className='space-y-8 lg:col-span-3'>
          {error && <ErrorBox>{error}</ErrorBox>}
          <div className='rounded-lg border p-6'>
            <h3 className='mb-4 text-lg font-semibold'>1. Delivery address</h3>
            <div className='grid gap-4 sm:grid-cols-2'>
              <Field label='Full name'><input className={inputClass} value={address.fullName} onChange={set('fullName')} required /></Field>
              <Field label='Phone'><input className={inputClass} value={address.phone} onChange={set('phone')} required type='tel' /></Field>
              <div className='sm:col-span-2'><Field label='Street address'><input className={inputClass} value={address.street} onChange={set('street')} required /></Field></div>
              <Field label='City / town'><input className={inputClass} value={address.city} onChange={set('city')} required /></Field>
              <Field label='Province'>
                <select className={inputClass} value={address.province} onChange={set('province')}>
                  {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label='Postal code'><input className={inputClass} value={address.postalCode} onChange={set('postalCode')} required inputMode='numeric' /></Field>
            </div>
          </div>

          <div className='rounded-lg border p-6'>
            <h3 className='mb-4 text-lg font-semibold'>2. Payment</h3>
            <CardFields card={card} setCard={setCard} />
          </div>
        </div>

        <aside className='lg:col-span-2'>
          <div className='sticky top-4 rounded-lg bg-primary-light p-6'>
            <h3 className='mb-4 text-lg font-semibold'>Your order</h3>
            {groups.map((g) => (
              <div key={g.store?._id} className='mb-4'>
                <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-text-light'><i className='ri-store-2-line'></i> {g.store?.name}</p>
                {g.items.map((i) => (
                  <div key={i._id} className='flex items-center justify-between gap-3 py-1 text-sm'>
                    <span className='truncate'>{i.quantity} × {i.name}</span>
                    <span className='whitespace-nowrap'>{formatPrice(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
            ))}
            <div className='space-y-1 border-t border-gray-300 pt-3 text-sm'>
              <div className='flex justify-between'><span>Subtotal</span><span>{formatPrice(totalPrice)}</span></div>
              <div className='flex justify-between'><span>VAT (15%)</span><span>{formatPrice(tax)}</span></div>
              <div className='flex justify-between'><span>Delivery</span><span>Free</span></div>
              <div className='flex justify-between pt-2 text-lg font-bold'><span>Total</span><span>{formatPrice(grandTotal)}</span></div>
            </div>
            <button disabled={isLoading} className='btn mt-6 w-full disabled:opacity-60'>
              {isLoading ? 'Processing payment...' : `Pay ${formatPrice(grandTotal)}`}
            </button>
          </div>
        </aside>
      </form>
    </>
  )
}

export default CheckoutPage
