import React from 'react'
import Banner from './Banner'
import Categories from './Categories'
import HeroSection from './HeroSection'
import TrendingProducts from '../shop/TrendingProducts'
import DealsSection from './DealsSection'
import PromoBanner from './PromoBanner'
import Blogs from '../blogs/Blogs'
import FeaturedStores from './FeaturedStores'
import SellCTA from './SellCTA'

const Home = () => {
  return (
    <>
      <Banner />
      <Categories />
      <FeaturedStores />
      <HeroSection />
      <TrendingProducts />
      <SellCTA />
      <DealsSection />
      <PromoBanner />
      <Blogs />
    </>
  )
}

export default Home
