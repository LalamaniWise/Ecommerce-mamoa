import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useLoginUserMutation } from '../redux/features/auth/authApi';
import { setUser } from '../redux/features/auth/authSlice';
import { errorMessage } from '../utils/format';

const Login = () => {
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [params] = useSearchParams();

    const dispatch = useDispatch();
    const [loginUser, { isLoading }] = useLoginUserMutation();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('')
        try {
            const { token, user, store } = await loginUser({ email, password }).unwrap();
            dispatch(setUser({ user, token, store }))
            const redirect = params.get('redirect')
            if (redirect && redirect.startsWith('/')) return navigate(redirect)
            navigate(user.role === 'admin' ? '/dashboard/admin' : user.role === 'vendor' ? '/dashboard/store' : '/')
        } catch (error) {
            setMessage(errorMessage(error, "Please provide a valid email and password"))
        }
    }

    return (
        <section className='min-h-screen flex items-center justify-center bg-primary-light px-4'>
            <div className='w-full max-w-sm border shadow bg-white mx-auto p-8 rounded-lg'>
                <Link to='/' className='block text-center text-2xl font-extrabold' style={{ fontFamily: 'var(--header-font)' }}>
                    mamoa<span className='text-primary'>.</span>
                </Link>
                <h2 className='flex items-center justify-center text-xl font-semibold pt-4'>SIGN IN</h2>
                <form onSubmit={handleLogin} className='space-y-5 pt-6'>
                    <input type='email' name='email' id='email' value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Email Address' required
                        className='w-full bg-gray-100 focus:outline-none px-5 py-3 rounded'
                    />
                    <input type='password' name='password' id='password' value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Password' required
                        className='w-full bg-gray-100 focus:outline-none px-5 py-3 rounded'
                    />
                    {message && <p className='text-red-500 text-sm'>{message}</p>}

                    <button type='submit' disabled={isLoading}
                        className='w-full mt-5 bg-primary text-white hover:bg-primary-dark font-medium py-3 rounded-md disabled:opacity-60'>
                        {isLoading ? 'Signing in...' : 'SIGN IN'}
                    </button>
                </form>

                <p className='my-5 italic text-sm text-center'>Don't have an account? Please{' '}
                    <Link to={`/register${params.get('redirect') ? `?redirect=${encodeURIComponent(params.get('redirect'))}` : ''}`} className='text-red-500'>Signup</Link> here.</p>
            </div>
        </section>
    )
}

export default Login
