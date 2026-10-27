import React, { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useLogOutUserMutation } from '../../redux/features/auth/authApi'
import { logout } from '../../redux/features/auth/authSlice'
import { baseApi } from '../../redux/api/baseApi'

const sections = {
  admin: [
    {
      title: 'Mall admin', links: [
        { to: '/dashboard/admin', label: 'Overview', icon: 'ri-dashboard-line', end: true },
        { to: '/dashboard/admin/stores', label: 'Stores', icon: 'ri-store-2-line' },
        { to: '/dashboard/admin/users', label: 'Users', icon: 'ri-team-line' },
        { to: '/dashboard/admin/plans', label: 'Rental plans', icon: 'ri-price-tag-3-line' },
        { to: '/dashboard/admin/orders', label: 'All orders', icon: 'ri-file-list-3-line' },
        { to: '/dashboard/admin/payments', label: 'Rent payments', icon: 'ri-bank-card-line' },
      ],
    },
  ],
  vendor: [
    {
      title: 'My store', links: [
        { to: '/dashboard/store', label: 'Overview', icon: 'ri-dashboard-line', end: true },
        { to: '/dashboard/store/products', label: 'Products', icon: 'ri-shopping-bag-3-line' },
        { to: '/dashboard/store/orders', label: 'Orders', icon: 'ri-file-list-3-line' },
        { to: '/dashboard/store/settings', label: 'Store settings', icon: 'ri-settings-3-line' },
        { to: '/dashboard/store/subscription', label: 'Subscription', icon: 'ri-bank-card-line' },
      ],
    },
  ],
  user: [],
}

const shopperLinks = {
  title: 'My account', links: [
    { to: '/dashboard/orders', label: 'My purchases', icon: 'ri-shopping-cart-line' },
    { to: '/dashboard/profile', label: 'Profile', icon: 'ri-user-line' },
  ],
}

const DashboardLayout = () => {
  const { user, store } = useSelector((s) => s.auth)
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [logoutUser] = useLogOutUserMutation()

  const accountLinks = user.role === 'user'
    ? { ...shopperLinks, links: [{ to: '/dashboard', label: 'Overview', icon: 'ri-dashboard-line', end: true }, ...shopperLinks.links] }
    : shopperLinks
  const groups = [...(sections[user.role] || []), accountLinks]

  const handleLogout = async () => {
    try { await logoutUser().unwrap() } catch (_) { /* ignore */ }
    dispatch(logout())
    dispatch(baseApi.util.resetApiState())
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-primary text-white' : 'text-text-dark hover:bg-gray-100'}`

  return (
    <div className='min-h-screen bg-extra-light md:flex'>
      {/* sidebar */}
      <aside className={`${open ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0 border-r bg-white md:min-h-screen`}>
        <div className='flex items-center justify-between p-5'>
          <Link to='/' className='text-2xl font-extrabold' style={{ fontFamily: 'var(--header-font)' }}>
            mamoa<span className='text-primary'>.</span>
          </Link>
        </div>
        <div className='px-5 pb-4 text-sm'>
          <p className='font-semibold truncate'>{user.username}</p>
          <p className='text-text-light'>{user.role === 'admin' ? 'Mall admin' : user.role === 'vendor' ? (store?.name || 'Store owner') : 'Shopper'}</p>
        </div>
        <div className='space-y-6 px-3 pb-6'>
          {groups.map((g) => (
            <div key={g.title}>
              <p className='mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-light'>{g.title}</p>
              <div className='space-y-1'>
                {g.links.map((l) => (
                  <NavLink key={l.to} to={l.to} end={l.end} className={linkClass} onClick={() => setOpen(false)}>
                    <i className={l.icon}></i>{l.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
          <div className='space-y-1 border-t pt-4'>
            {user.role === 'vendor' && store?.slug && (
              <Link to={`/stores/${store.slug}`} className='flex items-center gap-3 rounded-md px-3 py-2 text-sm text-text-dark hover:bg-gray-100'>
                <i className='ri-external-link-line'></i>View my store
              </Link>
            )}
            {user.role === 'user' && (
              <Link to='/sell' className='flex items-center gap-3 rounded-md px-3 py-2 text-sm text-primary hover:bg-gray-100'>
                <i className='ri-store-3-line'></i>Open a store
              </Link>
            )}
            <Link to='/' className='flex items-center gap-3 rounded-md px-3 py-2 text-sm text-text-dark hover:bg-gray-100'>
              <i className='ri-home-4-line'></i>Back to the mall
            </Link>
            <button onClick={handleLogout} className='flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-text-dark hover:bg-gray-100'>
              <i className='ri-logout-box-r-line'></i>Logout
            </button>
          </div>
        </div>
      </aside>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between border-b bg-white px-4 py-3 md:hidden'>
          <button onClick={() => setOpen(!open)} className='text-2xl' aria-label='Menu'><i className={open ? 'ri-close-line' : 'ri-menu-line'}></i></button>
          <span className='font-semibold'>Dashboard</span>
          <span></span>
        </div>
        <main className='p-4 md:p-8'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export const DashTitle = ({ title, children, action }) => (
  <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
    <div>
      <h1 className='text-2xl font-bold text-text-dark'>{title}</h1>
      {children && <p className='text-sm text-text-light'>{children}</p>}
    </div>
    {action}
  </div>
)

export default DashboardLayout
