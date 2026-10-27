import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DashTitle } from '../DashboardLayout'
import ImageUpload from '../../../components/common/ImageUpload'
import { ErrorBox, Field, Loader, SuccessBox, inputClass } from '../../../components/common/ui'
import { useFetchMyStoreQuery, useUpdateMyStoreMutation } from '../../../redux/features/stores/storesApi'
import { setUser } from '../../../redux/features/auth/authSlice'
import { errorMessage } from '../../../utils/format'

const fields = ['name', 'tagline', 'description', 'category', 'logo', 'banner', 'themeColor', 'contactEmail', 'phone', 'city']

const StoreSettings = () => {
  const { data: mine, isLoading } = useFetchMyStoreQuery()
  const [updateStore, { isLoading: saving }] = useUpdateMyStoreMutation()
  const { user, store: authStore } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const [form, setForm] = useState(null)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    if (mine?.store) setForm(Object.fromEntries(fields.map((k) => [k, mine.store[k] ?? ''])))
  }, [mine])

  if (isLoading || !form) return <Loader />
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg(null)
    try {
      const res = await updateStore(form).unwrap()
      dispatch(setUser({ user, store: { ...authStore, name: res.store.name } }))
      setMsg({ ok: true, text: 'Store updated' })
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) })
    }
  }

  return (
    <>
      <DashTitle title='Store settings'>Your store's web address: /stores/{mine.store.slug}</DashTitle>
      <form onSubmit={handleSubmit} className='max-w-3xl space-y-5 rounded-lg border bg-white p-6'>
        {msg && (msg.ok ? <SuccessBox>{msg.text}</SuccessBox> : <ErrorBox>{msg.text}</ErrorBox>)}
        <div className='grid gap-4 sm:grid-cols-2'>
          <Field label='Store name'><input className={inputClass} value={form.name} onChange={set('name')} required maxLength={60} /></Field>
          <Field label='Category'><input className={inputClass} value={form.category} onChange={set('category')} /></Field>
        </div>
        <Field label='Tagline'><input className={inputClass} value={form.tagline} onChange={set('tagline')} maxLength={120} /></Field>
        <Field label='About your store'><textarea className={inputClass} rows={5} value={form.description} onChange={set('description')} maxLength={2000} /></Field>
        <div className='grid gap-4 sm:grid-cols-2'>
          <Field label='Contact email'><input className={inputClass} type='email' value={form.contactEmail} onChange={set('contactEmail')} /></Field>
          <Field label='Phone'><input className={inputClass} type='tel' value={form.phone} onChange={set('phone')} /></Field>
          <Field label='City'><input className={inputClass} value={form.city} onChange={set('city')} /></Field>
          <Field label='Brand colour'><input type='color' className='h-10 w-full rounded-md border' value={form.themeColor || '#ed3849'} onChange={set('themeColor')} /></Field>
        </div>
        <ImageUpload label='Logo' value={form.logo} onChange={(logo) => setForm({ ...form, logo })} previewClass='h-24 w-24 rounded-full' />
        <ImageUpload label='Banner' value={form.banner} onChange={(banner) => setForm({ ...form, banner })} previewClass='h-24 w-48' />
        <button disabled={saving} className='btn disabled:opacity-60'>{saving ? 'Saving...' : 'Save changes'}</button>
      </form>
    </>
  )
}

export default StoreSettings
