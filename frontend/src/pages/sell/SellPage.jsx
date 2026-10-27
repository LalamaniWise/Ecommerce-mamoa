import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PlanCards from './PlanCards'
import { useFetchPlansQuery } from '../../redux/features/stores/storesApi'
import { Loader } from '../../components/common/ui'

const steps = [
  { icon: 'ri-file-list-3-line', title: 'Pick a plan', text: 'Choose how many products you want to sell. Pay monthly, upgrade any time.' },
  { icon: 'ri-store-2-line', title: 'Set up your store', text: 'Add your logo, banner and story. Your store gets its own page in the mall.' },
  { icon: 'ri-upload-cloud-2-line', title: 'Upload products', text: 'Add photos, prices and stock from your store dashboard.' },
  { icon: 'ri-truck-line', title: 'Sell and ship', text: 'Shoppers pay at the mall checkout. You see your orders and ship them.' },
]

// "Rent a space" landing page for business owners
const SellPage = () => {
  const { user, store } = useSelector((s) => s.auth)
  const { data: plans = [], isLoading } = useFetchPlansQuery()
  const navigate = useNavigate()

  const start = (plan) => navigate(`/sell/open${plan ? `?plan=${plan._id}` : ''}`)

  return (
    <>
      <section className='section__container bg-primary-light text-center'>
        <h2 className='section__header'>Open your store in Mamoa Mall</h2>
        <p className='section__subheader'>Rent a space in our online mall and start selling to shoppers across South Africa — no website or developer needed.</p>
        <div className='mt-8'>
          {user?.role === 'vendor' || store
            ? <Link to='/dashboard/store' className='btn inline-block'>Go to my store dashboard</Link>
            : <button onClick={() => start()} className='btn'>Get started</button>}
        </div>
      </section>

      <section className='section__container'>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {steps.map((s, i) => (
            <div key={s.title} className='rounded-lg border p-6'>
              <i className={`${s.icon} text-3xl text-primary`}></i>
              <h4 className='mt-3 font-semibold'>{i + 1}. {s.title}</h4>
              <p className='mt-1 text-sm text-text-light'>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='section__container pt-0'>
        <h2 className='section__header'>Monthly rent</h2>
        <p className='section__subheader mb-12'>Simple pricing. No commission on your sales.</p>
        {isLoading ? <Loader /> : (
          <PlanCards plans={plans} onSelect={user?.role === 'vendor' ? undefined : start} actionLabel='Start with this plan' />
        )}
      </section>
    </>
  )
}

export default SellPage
