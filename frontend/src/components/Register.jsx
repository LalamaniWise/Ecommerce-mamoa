import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLoginUserMutation, useRegisterUserMutation } from '../redux/features/auth/authApi';
import { setUser } from '../redux/features/auth/authSlice';
import { errorMessage } from '../utils/format';

const Register = () => {
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [params] = useSearchParams();

    const [registerUser, { isLoading }] = useRegisterUserMutation();
    const [loginUser] = useLoginUserMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('')
        try {
            await registerUser({ username, email, password }).unwrap();
            // log straight in after signing up
            const { token, user, store } = await loginUser({ email, password }).unwrap();
            dispatch(setUser({ user, token, store }))
            const redirect = params.get('redirect')
            navigate(redirect && redirect.startsWith('/') ? redirect : '/')
        } catch (error) {
            setMessage(errorMessage(error, "Registration failed"))
        }
    }

    return (
        <section className='min-h-screen flex items-center justify-center bg-primary-light px-4'>
            <div className='w-full max-w-sm border shadow bg-white mx-auto p-8 rounded-lg'>
                <Link to='/' className='block text-center text-2xl font-extrabold' style={{ fontFamily: 'var(--header-font)' }}>
                    mamoa<span className='text-primary'>.</span>
                </Link>
                <h2 className='flex items-center justify-center text-xl font-semibold pt-4'>SIGN UP</h2>
                <form onSubmit={handleRegister} className='space-y-5 pt-6'>
                    <input type='text' name='username' id='username' value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder='Name and Surname' required
                        className='w-full bg-gray-100 focus:outline-none px-5 py-3 rounded'
                    />
                    <input type='email' name='email' id='email' value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Email Address' required
                        className='w-full bg-gray-100 focus:outline-none px-5 py-3 rounded'
                    />
                    <input type='password' name='password' id='password' value={password} minLength={6}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Password (min 6 characters)' required
                        className='w-full bg-gray-100 focus:outline-none px-5 py-3 rounded'
                    />
                    {message && <p className='text-red-500 text-sm'>{message}</p>}

                    <button type='submit' disabled={isLoading}
                        className='w-full mt-5 bg-primary text-white hover:bg-primary-dark font-medium py-3 rounded-md disabled:opacity-60'>
                        {isLoading ? 'Creating account...' : 'SIGN UP'}
                    </button>
                </form>

                <p className='my-5 italic text-sm text-center'>Already have an account? Please{' '}
                    <Link to={`/login${params.get('redirect') ? `?redirect=${encodeURIComponent(params.get('redirect'))}` : ''}`} className='text-red-500'>Signin</Link> here.</p>
            </div>
        </section>
    )
}

export default Register
