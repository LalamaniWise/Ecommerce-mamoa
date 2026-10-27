import React, { useState } from 'react'
import { DashTitle } from '../DashboardLayout'
import { Loader, ErrorBox, Field, StatusBadge, inputClass } from '../../../components/common/ui'
import { useFetchPlansQuery } from '../../../redux/features/stores/storesApi'
import { useCreatePlanMutation, useDeletePlanMutation, useUpdatePlanMutation } from '../../../redux/features/admin/adminApi'
import { errorMessage, formatPrice } from '../../../utils/format'

const blank = { name: '', description: '', priceMonthly: '', productLimit: '', features: '', highlighted: false, isActive: true, sortOrder: 0 }

// The mall owner sets what it costs to rent a store.
const AdminPlans = () => {
  const { data: plans = [], isLoading, error } = useFetchPlansQuery({ all: 'true' })
  const [createPlan] = useCreatePlanMutation()
  const [updatePlan] = useUpdatePlanMutation()
  const [deletePlan] = useDeletePlanMutation()
  const [editing, setEditing] = useState(null) // null | 'new' | plan id
  const [form, setForm] = useState(blank)
  const [msg, setMsg] = useState('')

  const startEdit = (plan) => {
    setEditing(plan ? plan._id : 'new')
    setForm(plan ? { ...plan, features: (plan.features || []).join('\n') } : blank)
    setMsg('')
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const save = async (e) => {
    e.preventDefault()
    const body = {
      name: form.name, description: form.description, features: form.features,
      priceMonthly: Number(form.priceMonthly), productLimit: Number(form.productLimit),
      highlighted: form.highlighted, isActive: form.isActive, sortOrder: Number(form.sortOrder) || 0,
    }
    try {
      if (editing === 'new') await createPlan(body).unwrap()
      else await updatePlan({ id: editing, ...body }).unwrap()
      setEditing(null)
    } catch (err) { setMsg(errorMessage(err)) }
  }

  const remove = async (plan) => {
    if (!window.confirm(`Delete the ${plan.name} plan?`)) return
    try { await deletePlan(plan._id).unwrap() } catch (err) { setMsg(errorMessage(err)) }
  }

  return (
    <>
      <DashTitle title='Rental plans' action={<button onClick={() => startEdit(null)} className='btn text-sm'><i className='ri-add-line'></i> New plan</button>}>
        What store owners pay each month for their space. Price changes apply when stores next renew.
      </DashTitle>
      {msg && <div className='mb-4'><ErrorBox>{msg}</ErrorBox></div>}

      {editing && (
        <form onSubmit={save} className='mb-6 max-w-3xl space-y-4 rounded-lg border bg-white p-6'>
          <h3 className='font-semibold'>{editing === 'new' ? 'New plan' : `Edit ${form.name}`}</h3>
          <div className='grid gap-4 sm:grid-cols-3'>
            <Field label='Name'><input className={inputClass} value={form.name} onChange={set('name')} required /></Field>
            <Field label='Price per month (R)'><input className={inputClass} type='number' min='0' step='0.01' value={form.priceMonthly} onChange={set('priceMonthly')} required /></Field>
            <Field label='Product limit'><input className={inputClass} type='number' min='1' value={form.productLimit} onChange={set('productLimit')} required /></Field>
          </div>
          <Field label='Short description'><input className={inputClass} value={form.description} onChange={set('description')} /></Field>
          <Field label='Features' hint='One per line'><textarea className={inputClass} rows={4} value={form.features} onChange={set('features')} /></Field>
          <div className='flex flex-wrap items-center gap-6 text-sm'>
            <label className='flex items-center gap-2'><input type='checkbox' checked={form.isActive} onChange={set('isActive')} /> Available to new stores</label>
            <label className='flex items-center gap-2'><input type='checkbox' checked={form.highlighted} onChange={set('highlighted')} /> Mark as "most popular"</label>
            <label className='flex items-center gap-2'>Order <input type='number' className='w-16 rounded border px-2 py-1' value={form.sortOrder} onChange={set('sortOrder')} /></label>
          </div>
          <div className='flex gap-3'>
            <button type='button' onClick={() => setEditing(null)} className='rounded-md border px-6 py-2'>Cancel</button>
            <button className='btn'>Save plan</button>
          </div>
        </form>
      )}

      {isLoading ? <Loader /> : error ? <ErrorBox>{errorMessage(error)}</ErrorBox> : (
        <div className='grid gap-4 md:grid-cols-3'>
          {plans.map((p) => (
            <div key={p._id} className='rounded-lg border bg-white p-5'>
              <div className='flex items-start justify-between'>
                <h4 className='text-lg font-bold'>{p.name}</h4>
                <StatusBadge status={p.isActive ? 'active' : 'hidden'} label={p.isActive ? 'Active' : 'Hidden'} />
              </div>
              <p className='text-2xl font-extrabold'>{formatPrice(p.priceMonthly)}<span className='text-sm font-normal text-text-light'>/month</span></p>
              <p className='text-sm text-text-light'>Up to {p.productLimit} products</p>
              <ul className='mt-3 space-y-1 text-sm'>{(p.features || []).map((f) => <li key={f}>• {f}</li>)}</ul>
              <div className='mt-4 flex gap-3 text-sm'>
                <button onClick={() => startEdit(p)} className='text-primary hover:underline'>Edit</button>
                <button onClick={() => remove(p)} className='text-red-600 hover:underline'>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default AdminPlans
