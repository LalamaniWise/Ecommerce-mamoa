import React from 'react'

const PromoBanner = () => {
  return (
    <section className='section__container banner__container'>
        <div className='banner__card'>
            <span>
                <i className="ri-truck-line"></i>
                </span>
                <h4>Free delivery</h4>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vel adipisci aut possimus </p>
            
        </div>
           <div className='banner__card'>
            <span>
                <i className="ri-money-dollar-circle-line"></i> 
                </span>
                <h4>100% money Back</h4>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vel adipisci aut possimus </p>
           
        </div>
           <div className='banner__card'>
            <span>
                <i className="ri-user-voice-fill"></i>
                </span>
                <h4>Strong Support</h4>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vel adipisci aut possimus </p>
            
        </div>
    </section>
  )
}

export default PromoBanner