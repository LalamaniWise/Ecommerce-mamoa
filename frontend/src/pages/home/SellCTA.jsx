import React from 'react'
import { Link } from 'react-router-dom'

const SellCTA = () => (
  <section className='section__container'>
    <div className='flex flex-col items-center gap-6 rounded-2xl bg-text-dark px-6 py-12 text-center text-white md:flex-row md:justify-between md:px-12 md:text-left'>
      <div>
        <h3 className='text-3xl font-extrabold' style={{ fontFamily: 'var(--header-font)' }}>Rent your space in the mall</h3>
        <p className='mt-2 max-w-xl text-gray-300'>
          Open your own online store in minutes. Upload your products, manage orders, and reach shoppers
          already browsing Mamoa — from R199 a month.
        </p>
      </div>
      <Link to='/sell' className='btn inline-block whitespace-nowrap'>Open your store</Link>
    </div>
  </section>
)

export default SellCTA
