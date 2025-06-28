import React from 'react'
import { Link } from 'react-router-dom'
import bannerImg from '../../assets/image1.webp'

const Banner = () => {
  return (
    <div className='section__container header__container'>
        <div className='header__content z-30'> 
            <h4>UP TO 20% Discount on</h4>
            <h1>MAMOA SKIN CARE</h1>
            <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Recusandae facere iure, 
                possimus reiciendis ipsam earum veritatis mollitia sapiente a eum voluptatem 
                odit laboriosam distinctio! Quisquam nostrum aliquam reiciendis rem ratione.</p>
            <button className='btn'>
                <Link to='/shop'>EXPLORE NOW</Link>
                </button>    
        </div>
        <div className='header__image'>
            <img src={bannerImg} alt="banner image"/>
        </div>
      
    </div>
  )
}

export default Banner
