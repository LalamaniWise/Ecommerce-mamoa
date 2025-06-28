import React from 'react'
import dealsImg from "../../assets/deals.png"

const DealsSection = () => {
  return (
    <section className='section__container deals__container'>
      <div className='deals__image'> 
        <img src={dealsImg} alt=''/>
      </div>
      <div className='deals__content'>
        <h5>Get up to 25% Discount</h5>
        <h4>Deals Of This Month</h4>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex soluta reiciendis labore 
            natus quis ipsum odit iure eligendi delectus, quia magnam, porro consequuntur. 
            Exercitationem ducimus accusantium veritatis magnam culpa veniam.</p>
        <div className='deals__countdown flex-wrap'>
            <div className='deals__countdown__card'>
                <h4>14</h4>
                <p>Days</p>
            </div>
             <div className='deals__countdown__card'>
                <h4>20</h4>
                <p>hours</p>
            </div>
             <div className='deals__countdown__card'>
                <h4>15</h4>
                <p>Min</p>
            </div>
             <div className='deals__countdown__card'>
                <h4>05</h4>
                <p>Sec</p>
            </div>

        </div>

      </div>
    </section>
  )
}

export default DealsSection
