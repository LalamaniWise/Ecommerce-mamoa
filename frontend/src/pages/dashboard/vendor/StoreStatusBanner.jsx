import React from 'react'
import { Link } from 'react-router-dom'
import { daysUntil, formatDate } from '../../../utils/format'

// Tells the store owner why shoppers can't see their store (if they can't).
const StoreStatusBanner = ({ store }) => {
  if (!store) return null
  const days = daysUntil(store.subscription?.currentPeriodEnd)

  let tone = null
  let text = null
  if (store.status === 'pending') {
    tone = 'amber'
    text = 'Your store is waiting for approval by the mall team. You can add products now — shoppers will see them once you are approved.'
  } else if (store.status === 'suspended' || store.status === 'rejected') {
    tone = 'red'
    text = `Your store has been ${store.status} by the mall.${store.statusNote ? ` Reason: ${store.statusNote}` : ''} Contact the mall team for help.`
  } else if (days <= 0) {
    tone = 'red'
    text = <>Your rent expired on {formatDate(store.subscription.currentPeriodEnd)}, so your store is hidden from shoppers. <Link to='/dashboard/store/subscription' className='font-semibold underline'>Pay now</Link></>
  } else if (days <= 5) {
    tone = 'amber'
    text = <>Your rent is due in {days} day{days === 1 ? '' : 's'}. <Link to='/dashboard/store/subscription' className='font-semibold underline'>Renew now</Link> to keep your store open.</>
  }
  if (!text) return null

  const cls = tone === 'red' ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-amber-50 text-amber-800'
  return <div className={`mb-6 rounded-md border px-4 py-3 text-sm ${cls}`}><i className='ri-information-line'></i> {text}</div>
}

export default StoreStatusBanner
