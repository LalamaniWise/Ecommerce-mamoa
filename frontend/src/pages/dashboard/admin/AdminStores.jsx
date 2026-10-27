import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DashTitle } from '../DashboardLayout'
import { Loader, ErrorBox, EmptyState, StatusBadge, inputClass } from '../../../components/common/ui'
import { useExtendStoreMutation, useFetchAdminStoresQuery, useUpdateStoreStatusMutation } from '../../../redux/features/admin/adminApi'
import { daysUntil, errorMessage, formatDate } from '../../../utils/format'

const tabs = ['all', 'pending', 'active', 'overdue', 'suspended', 'rejected']

const AdminStores = () => {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') || 'all'
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const { data: stores = [], isLoading, error } = useFetchAdminStoresQuery({ status, q: search || undefined })
  const [updateStatus] = useUpdateStoreStatusMutation()
  const [extend] = useExtendStoreMutation()
  const [msg, setMsg] = useState('')

  const act = async (fn) => {
    setMsg('')
    try { const r = await fn().unwrap(); setMsg(r.message) } catch (e) { setMsg(errorMessage(e)) }
  }

  const changeStatus = (store, newStatus) => {
    let note = ''
    if (newStatus === 'suspended' || newStatus === 'rejected') {
      note = window.prompt(`Reason for ${newStatus === 'suspended' ? 'suspending' : 'rejecting'} ${store.name} (shown to the owner):`)
      if (note === null) return
    }
    act(() => updateStatus({ id: store._id, status: newStatus, note }))
  }

  const giveDays = (store) => {
    const days = window.prompt(`Give ${store.name} how many free days of rent?`, '30')
    if (days) act(() => extend({ id: store._id, days: Number(days) }))
  }

  return (
    <>
      <DashTitle title='Stores'>Approve new stores, suspend stores that break the rules, and help with rent.</DashTitle>
      <div className='mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
        <div className='flex flex-wrap gap-2'>
          {tabs.map((t) => (
            <button key={t} onClick={() => setParams(t === 'all' ? {} : { status: t })}
              className={`rounded-full px-4 py-1.5 text-sm capitalize ${status === t ? 'bg-primary text-white' : 'border bg-white hover:bg-gray-50'}`}>{t}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setSearch(q.trim()) }} className='flex max-w-sm gap-2'>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search stores...' className={inputClass} />
          <button className='rounded-md bg-primary px-3 text-white'><i className='ri-search-line'></i></button>
        </form>
      </div>
      {msg && <p className='mb-3 text-sm text-text-light'>{msg}</p>}

      {isLoading ? <Loader /> : error ? <ErrorBox>{errorMessage(error)}</ErrorBox> :
        stores.length === 0 ? <EmptyState icon='ri-store-2-line' title='No stores here' /> : (
          <div className='overflow-x-auto rounded-lg border bg-white'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50 text-left text-text-light'>
                <tr>
                  <th className='p-3'>Store</th><th className='p-3'>Owner</th><th className='p-3'>Plan</th>
                  <th className='p-3'>Rent paid until</th><th className='p-3'>Products</th><th className='p-3'>Status</th><th className='p-3 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => {
                  const days = daysUntil(s.subscription?.currentPeriodEnd)
                  return (
                    <tr key={s._id} className='border-t align-top'>
                      <td className='p-3'>
                        <p className='font-medium'>{s.name}</p>
                        <p className='text-xs capitalize text-text-light'>{s.category}{s.city && ` · ${s.city}`}</p>
                      </td>
                      <td className='p-3'>{s.owner?.username}<br /><span className='text-xs text-text-light'>{s.owner?.email}</span></td>
                      <td className='p-3'>{s.subscription?.plan?.name}</td>
                      <td className={`p-3 whitespace-nowrap ${days <= 0 ? 'text-red-600' : ''}`}>
                        {formatDate(s.subscription?.currentPeriodEnd)}<br />
                        <span className='text-xs'>{days > 0 ? `${days} days left` : 'overdue'}</span>
                      </td>
                      <td className='p-3'>{s.productCount}</td>
                      <td className='p-3'><StatusBadge status={s.status === 'active' && days <= 0 ? 'overdue' : s.status} /></td>
                      <td className='p-3 text-right whitespace-nowrap space-x-2'>
                        {s.status === 'active' && <Link to={`/stores/${s.slug}`} className='text-primary hover:underline'>View</Link>}
                        {s.status !== 'active' && <button onClick={() => changeStatus(s, 'active')} className='text-green-700 hover:underline'>{s.status === 'pending' ? 'Approve' : 'Re-open'}</button>}
                        {s.status === 'pending' && <button onClick={() => changeStatus(s, 'rejected')} className='text-red-600 hover:underline'>Reject</button>}
                        {s.status === 'active' && <button onClick={() => changeStatus(s, 'suspended')} className='text-red-600 hover:underline'>Suspend</button>}
                        <button onClick={() => giveDays(s)} className='text-text-dark hover:underline'>Free days</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
    </>
  )
}

export default AdminStores
