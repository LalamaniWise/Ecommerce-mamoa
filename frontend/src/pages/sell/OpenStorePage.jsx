import React, { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import PlanCards from './PlanCards'
import CardFields from '../../components/common/CardFields'
import ImageUpload from '../../components/common/ImageUpload'
import { ErrorBox, Field, Loader, PageHeader, inputClass } from '../../components/common/ui'
import { useFetchPlansQuery, useOpenStoreMutation } from '../../redux/features/stores/storesApi'
import { useLazyGetMeQuery } from '../../redux/features/auth/authApi'
import { setUser } from '../../redux/features/auth/authSlice'
import { errorMessage, formatPrice } from '../../utils/format'

const CATEGORIES = ['fashion', 'cosmetics', 'jewellery', 'accessories', 'shoes', 'electronics', 'home', 'food', 'kids', 'sports', 'other']

// 3 steps: choose plan -> store details -> pay first month
const OpenStorePage = () => {
  const [params] = useSearchParams()
  const { user, store: existing } = useSelector((s) => s.auth)
  const { data: plans = [], isLoading } = useFetchPlansQuery()
  const [openStore, { isLoading: saving }] = useOpenStoreMutation()
  const [getMe] = useLazyGetMeQuery()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [step, setStep] = useState(params.get('plan') ? 2 : 1)
  const [planId, setPlanId] = useState(params.get('plan') || '')
  const [form, setForm] = useState({ name: '', tagline: '', description: '', category: 'fashion', city: '', phone: '', logo: '', banner: '', themeColor: '#ed3849' })
  const [card, setCard] = useState({ name: user?.username || '' })
  const [error, setError] = useState('')
  const justOpened = useRef(false)

  useEffect(() => { window.scrollTo(0, 0) }, [step])

  if ((existing || user?.role === 'vendor') && !justOpened.current) return <Navigate to='/dashboard/store' replace />
  if (isLoading) return <Loader />

  const plan = plans.find((p) => p._id === planId)
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await openStore({ ...form, planId, card }).unwrap()
      // refresh my role (I am a store owner now)
      const me = await getMe().unwrap()
      justOpened.current = true
      dispatch(setUser({ user: me.user, store: me.store }))
      navigate('/dashboard/store', { state: { message: res.message } })
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <>
      <PageHeader title='Open your store'>
        Step {step} of 3 — {step === 1 ? 'choose a plan' : step === 2 ? 'tell shoppers about your store' : 'pay your first month'}
      </PageHeader>

      <section className='section__container'>
        {error && <div className='mb-6'><ErrorBox>{error}</ErrorBox></div>}

        {step === 1 && (
          <>
            <PlanCards plans={plans} selectedId={planId} onSelect={(p) => setPlanId(p._id)} />
            <div className='mt-8 text-right'>
              <button disabled={!planId} onClick={() => setStep(2)} className='btn disabled:opacity-50'>Continue</button>
            </div>
          </>
        )}

        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(3) }} className='mx-auto max-w-3xl space-y-5'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <Field label='Store name'><input className={inputClass} value={form.name} onChange={set('name')} required maxLength={60} /></Field>
              <Field label='Category'>
                <select className={inputClass} value={form.category} onChange={set('category')}>
                  {CATEGORIES.map((c) => <option key={c} value={c} className='capitalize'>{c}</option>)}
                </select>
              </Field>
            </div>
            <Field label='Tagline' hint='One short line shown under your store name'>
              <input className={inputClass} value={form.tagline} onChange={set('tagline')} maxLength={120} />
            </Field>
            <Field label='About your store'>
              <textarea className={inputClass} rows={4} value={form.description} onChange={set('description')} maxLength={2000} />
            </Field>
            <div className='grid gap-4 sm:grid-cols-3'>
              <Field label='City'><input className={inputClass} value={form.city} onChange={set('city')} /></Field>
              <Field label='Phone'><input className={inputClass} value={form.phone} onChange={set('phone')} type='tel' /></Field>
              <Field label='Brand colour'><input type='color' className='h-10 w-full rounded-md border' value={form.themeColor} onChange={set('themeColor')} /></Field>
            </div>
            <ImageUpload label='Logo' value={form.logo} onChange={(logo) => setForm({ ...form, logo })} previewClass='h-24 w-24 rounded-full' />
            <ImageUpload label='Banner (wide picture at the top of your store)' value={form.banner} onChange={(banner) => setForm({ ...form, banner })} previewClass='h-24 w-48' />
            <div className='flex justify-between pt-4'>
              <button type='button' onClick={() => setStep(1)} className='rounded-md border px-6 py-3'>Back</button>
              <button className='btn'>Continue to payment</button>
            </div>
          </form>
        )}

        {step === 3 && plan && (
          <form onSubmit={handleSubmit} className='mx-auto grid max-w-4xl gap-8 md:grid-cols-2'>
            <div className='rounded-lg border p-6'>
              <CardFields card={card} setCard={setCard} />
            </div>
            <div className='rounded-lg bg-primary-light p-6'>
              <h3 className='text-lg font-semibold'>Summary</h3>
              <p className='mt-3'><b>{form.name}</b></p>
              <p className='text-sm text-text-light capitalize'>{form.category}{form.city && ` · ${form.city}`}</p>
              <div className='mt-4 flex justify-between border-t border-gray-300 pt-4'>
                <span>{plan.name} plan (30 days)</span><span>{formatPrice(plan.priceMonthly)}</span>
              </div>
              <p className='mt-1 text-xs text-text-light'>Up to {plan.productLimit} products. Renew monthly from your dashboard.</p>
              <p className='mt-4 text-sm text-text-light'>After payment the mall team reviews your store. You can add products while you wait.</p>
              <div className='mt-6 flex gap-3'>
                <button type='button' onClick={() => setStep(2)} className='rounded-md border px-6 py-3'>Back</button>
                <button disabled={saving} className='btn flex-1 disabled:opacity-60'>
                  {saving ? 'Processing...' : `Pay ${formatPrice(plan.priceMonthly)} & open store`}
                </button>
              </div>
            </div>
          </form>
        )}
        {step === 3 && !plan && <ErrorBox>Please go back and choose a plan.</ErrorBox>}
      </section>
    </>
  )
}

export default OpenStorePage
