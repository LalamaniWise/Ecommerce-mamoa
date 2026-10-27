import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import CartModal from '../pages/shop/CartModal';
import avatarImg from "../assets/avatar.png"
import { useLogOutUserMutation } from '../redux/features/auth/authApi';
import { logout } from '../redux/features/auth/authSlice';
import { baseApi } from '../redux/api/baseApi';

// dropdown menus per role
const menus = {
  admin: [
    { label: "Mall Dashboard", path: "/dashboard/admin" },
    { label: "Stores", path: "/dashboard/admin/stores" },
    { label: "Users", path: "/dashboard/admin/users" },
    { label: "Plans", path: "/dashboard/admin/plans" },
    { label: "All Orders", path: "/dashboard/admin/orders" },
  ],
  vendor: [
    { label: "My Store", path: "/dashboard/store" },
    { label: "Products", path: "/dashboard/store/products" },
    { label: "Store Orders", path: "/dashboard/store/orders" },
    { label: "Subscription", path: "/dashboard/store/subscription" },
    { label: "My Purchases", path: "/dashboard/orders" },
  ],
  user: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "My Orders", path: "/dashboard/orders" },
    { label: "Profile", path: "/dashboard/profile" },
    { label: "Open a Store", path: "/sell" },
  ],
}

const Navbar = () => {
  const products = useSelector((state) => state.cart.products);
  const cartCount = products.reduce((n, p) => n + p.quantity, 0)
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropDownOpen, setisDropDownOpen] = useState(false);
  const dropdownRef = useRef(null)

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [logoutUser] = useLogOutUserMutation();
  const navigate = useNavigate();

  const dropDownMenus = menus[user?.role] || menus.user

  // close the dropdown when clicking elsewhere
  useEffect(() => {
    const close = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setisDropDownOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const handleLogout = async () => {
    try { await logoutUser().unwrap() } catch (_) { /* log out locally anyway */ }
    dispatch(logout())
    dispatch(baseApi.util.resetApiState())
    setisDropDownOpen(false)
    navigate('/')
  }

  const links = [
    { label: 'Home', to: '/' },
    { label: 'Stores', to: '/stores' },
    { label: 'Shop', to: '/shop' },
    { label: 'Sell on Mamoa', to: '/sell' },
  ]

  return (
    <header className='fixed-nav-bar w-nav relative z-40 bg-white'>
      <nav className='max-w-screen-2xl mx-auto px-4 flex justify-between items-center'>
        <ul className='nav__links hidden md:flex'>
          {links.map((l) => <li key={l.to} className='link'><Link to={l.to}>{l.label}</Link></li>)}
        </ul>
        <button className='md:hidden flex-1 text-left text-2xl' onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label='Menu'>
          <i className={isMenuOpen ? 'ri-close-line' : 'ri-menu-line'}></i>
        </button>

        {/*Logo */}
        <div className='nav__logo'>
          <Link to="/">mamoa<span>.</span><small className='ml-1 text-sm font-semibold tracking-widest text-text-light'>MALL</small></Link>
        </div>

        {/*nav icons*/}
        <div className='nav__icons relative'>
          <span>
            <Link to="/search" aria-label='Search'><i className="ri-search-line"></i></Link>
          </span>
          <span>
            <button onClick={() => setIsCartOpen(true)} className='hover:text-primary text-xl' aria-label='Cart'>
              <i className="ri-shopping-bag-line"></i>
              <sup className='text-sm inline-block px-1.5 text-white rounded-full bg-primary text-center'>{cartCount}</sup>
            </button>
          </span>
          <span ref={dropdownRef}>
            {user ? (<>
              <img
                onClick={() => setisDropDownOpen(!isDropDownOpen)}
                src={user?.profileImage || avatarImg} alt='Account' className='size-6 rounded-full cursor-pointer object-cover' />

              {isDropDownOpen && (
                <div className='absolute right-0 mt-3 p-4 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50'>
                  <div className='px-2 pb-3 mb-2 border-b'>
                    <p className='font-semibold text-sm truncate'>{user.username}</p>
                    <p className='text-xs text-text-light capitalize'>{user.role === 'user' ? 'shopper' : user.role === 'vendor' ? 'store owner' : 'mall admin'}</p>
                  </div>
                  <ul className='font-medium space-y-3 p-2'>
                    {dropDownMenus.map((menu) => (
                      <li key={menu.path + menu.label}>
                        <Link onClick={() => setisDropDownOpen(false)} className='dropdown-items' to={menu.path}>{menu.label}</Link>
                      </li>
                    ))}
                    <li>
                      <button onClick={handleLogout} className='dropdown-items text-left w-full hover:text-primary'>Logout</button>
                    </li>
                  </ul>
                </div>
              )}
            </>) : (<Link to="/login" aria-label='Log in'><i className="ri-user-line"></i></Link>)}
          </span>
        </div>
      </nav>

      {isMenuOpen && (
        <ul className='md:hidden border-t bg-white px-4 py-3 space-y-3'>
          {links.map((l) => (
            <li key={l.to} className='link'><Link onClick={() => setIsMenuOpen(false)} to={l.to}>{l.label}</Link></li>
          ))}
        </ul>
      )}

      {isCartOpen && <CartModal products={products} isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}
    </header>
  )
}

export default Navbar
