import React, { useState } from 'react'
import { DashTitle } from '../DashboardLayout'
import StoreStatusBanner from './StoreStatusBanner'
import PlanCards from '../../sell/PlanCards'
import CardFields from '../../../components/common/CardFields'
import { ErrorBox, Loader, SuccessBox } from '../../../components/common/ui'
import { useFetchMyPaymentsQuery, useFetchMyStoreQuery, useFetchPlansQuery, usePaySubscriptionMutation } from '../../../redux/features/stores/storesApi'
import { daysUntil, errorMessage, formatDate, formatPrice } from '../../../utils/format'

// The store owner's rent: current plan, renew, switch plan, receipts.
const Subscription = () => {
  const { data: mine, isLoading } = useFetchMyStoreQuery()
  const { data: plans = [] } = useFetchPlansQuery()
  const { data: payments = [] } = useFetchMyPaymentsQuery()
  const [pay, { isLoading: paying }] = usePaySubscriptionMutation()
  const [selected, setSelected] = useState(null)
  const [card, setCard] = useState({})
  const [msg, setMsg] = useState(null)

  if (isLoading) return <Loader />
  const { store, productCount } = mine
  const current = store.subscription.plan
  const days = daysUntil(store.subscription.currentPeriodEnd)
  const target = selected || current
  const isRenewal = target._id === current._id

  const handlePay = async (e) => {
    e.preventDefault()
    setMsg(null)
    try {
      const res = await pay({ planId: target._id, card }).unwrap()
      setMsg({ ok: true, text: res.message })
      setSelected(null)
      setCard({})
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) })
    }
  }

  return (
    <>
      <StoreStatusBanner store={store} />
      <DashTitle title='Subscription'>Your monthly rent for your space in the mall.</DashTitle>
      {msg && <div className='mb-6'>{msg.ok ? <SuccessBox>{msg.text}</SuccessBox> : <ErrorBox>{msg.text}</ErrorBox>}</div>}

      <div className='mb-8 grid gap-4 sm:grid-cols-3'>
        <div className='rounded-lg border bg-white p-5'>
          <p className='text-sm text-text-light'>Current plan</p>
          <p className='text-xl font-bold'>{current.name}</p>
          <p className='text-sm'>{formatPrice(current.priceMonthly)} / month</p>
        </div>
        <div className='rounded-lg border bg-white p-5'>
          <p className='text-sm text-text-light'>Paid until</p>
          <p className='text-xl font-bold'>{formatDate(store.subscription.currentPeriodEnd)}</p>
          <p className={`text-sm ${days <= 5 ? 'text-red-600' : ''}`}>{days > 0 ? `${days} days left` : 'Expired'}</p>
        </div>
        <div className='rounded-lg border bg-white p-5'>
          <p className='text-sm text-text-light'>Products used</p>
          <p className='text-xl font-bold'>{productCount} / {current.productLimit}</p>
          <div className='mt-2 h-2 rounded bg-gray-100'><div className='h-2 rounded bg-primary' style={{ width: `${Math.min(100, (productCount / current.productLimit) * 100)}%` }}></div></div>
        </div>
      </div>

      <h3 className='mb-4 font-semibold'>Change plan</h3>
      <PlanCards plans={plans} currentId={current._id} selectedId={selected?._id}
        onSelect={(p) => setSelected(p._id === current._id ? null : p)} actionLabel='Switch to this plan' />

      <form onSubmit={handlePay} className='mt-8 grid max-w-4xl gap-6 rounded-lg border bg-white p-6 md:grid-cols-2'>
        <div>
          <h3 className='font-semibold'>{isRenewal ? `Renew ${current.name}` : `Switch to ${target.name}`}</h3>
          <p className='mt-2 text-sm text-text-light'>
            {isRenewal
              ? `Adds 30 days to your rent, so you're paid up until ${formatDate(new Date(Math.max(Date.now(), new Date(store.subscription.currentPeriodEnd).getTime()) + 30 * 864e5))}.`
              : `Your new plan starts today and runs for 30 days. Product limit: ${target.productLimit}.`}
          </p>
          <p className='mt-4 text-2xl font-bold'>{formatPrice(target.priceMonthly)}</p>
          {!isRenewal && productCount > target.productLimit && (
            <p className='mt-2 text-sm text-red-600'>You have {productCount} products — remove some before moving to this plan.</p>
          )}
        </div>
        <div>
          <CardFields card={card} setCard={setCard} />
          <button disabled={paying} className='btn mt-4 w-full disabled:opacity-60'>
            {paying ? 'Processing...' : `Pay ${formatPrice(target.priceMonthly)}`}
          </button>
        </div>
      </form>

      <h3 className='mb-3 mt-10 font-semibold'>Rent receipts</h3>
      <div className='overflow-x-auto rounded-lg border bg-white'>
        <table className='w-full text-sm'>
          <thead className='bg-gray-50 text-left text-text-light'>
            <tr><th className='p-3'>Date</th><th className='p-3'>Plan</th><th className='p-3'>Period</th><th className='p-3'>Amount</th><th className='p-3'>Reference</th></tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className='border-t'>
                <td className='p-3'>{formatDate(p.createdAt)}</td>
                <td className='p-3'>{p.planName}</td>
                <td className='p-3 whitespace-nowrap'>{formatDate(p.periodStart)} – {formatDate(p.periodEnd)}</td>
                <td className='p-3'>{formatPrice(p.amount)}</td>
                <td className='p-3 font-mono text-xs'>{p.reference} · •••• {p.cardLast4}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default Subscription
