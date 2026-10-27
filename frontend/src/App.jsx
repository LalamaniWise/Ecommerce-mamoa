import { useEffect } from 'react'
import './App.css'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <>
      <Navbar />
      <main className='min-h-[60vh]'>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default App
