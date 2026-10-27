import React from 'react'
import { Link } from 'react-router-dom'
import bannerImg from '../../assets/image1.webp'

const Banner = () => {
  return (
    <div className='section__container header__container'>
      <div className='header__content z-30'>
        <h4>ONE MALL. MANY STORES.</h4>
        <h1>MAMOA MALL</h1>
        <p>Shop from independent South African businesses in one place — fashion, beauty,
          jewellery and more. One cart, one checkout, delivered by the stores you love.</p>
        <div className='flex flex-wrap gap-3'>
          <Link to='/shop' className='btn inline-block'>SHOP NOW</Link>
          <Link to='/stores' className='inline-block rounded-md border-2 border-primary px-6 py-[0.6rem] font-medium text-primary hover:bg-primary hover:text-white transition'>
            BROWSE STORES
          </Link>
        </div>
      </div>
      <div className='header__image'>
        <img src={bannerImg} alt="Mamoa Mall" />
      </div>
    </div>
  )
}

export default Banner
