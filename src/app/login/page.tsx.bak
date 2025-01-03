"use client";
import { useRouter } from 'next/navigation'
import React, { useState } from 'react';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [forgetMeNot, setForgetMeNot] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Dummy connection to a database
        const dummyDB = {
            user: 'testUser',
            pass: 'testPass'
        };

        if (username === dummyDB.user && password === dummyDB.pass) {
            setMessage('Login successful!');
            router.push('/Pages/Dashboard');
        } else {
            setMessage('Invalid username or password.');
        }
    };

    return (
        <div className='w-screen h-screen flex justify-center items-center flex-col bg-[#ebdfd7] text-black select-none'>
            <div className='bg-[#f2eae5] w-96 p-8 rounded-xl shadow-xl flex flex-col gap-4'>
                <div>
                    <h1 className='font-bold text-3xl float-left'>Sign in</h1>
                    <img src="/squarelogo.png" className="login-icon" alt="logo" />
                </div>
                <form onSubmit={handleLogin} className='flex flex-col gap-6'>
                    <div>
                        <label className='login-label' htmlFor="username">Username</label>
                        <input
                            type="text"
                            value={username}
                            className='login-input'
                            id="username"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className='login-label' htmlFor="password">Password</label>
                        <input
                            type="password"
                            value={password}
                            className='login-input'
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className='flex justify-between'>
                        <div className='flex items-center gap-[0.25em]'>
                            <input
                                type="checkbox"
                                id="forgetMeNot"
                                onChange={(e) => { setForgetMeNot(e.target.checked) }}
                                className=""
                            />
                            <label className="font-bold text-black cursor-pointer transition duration-[250ms] all ease-in-out hover:text-gray-500" htmlFor="forgetMeNot">Remember me</label>
                        </div>

                        <div className=''>
                            <a href="#" className='font-bold text-gray-500 transition all ease-in-out duration-[250ms] hover:text-[#0864c4]'>Forgot Password?</a>
                        </div>

                    </div>
                    <div className='text-center flex flex-col gap-2'>
                        <button type="submit" className='login-button'>Sign In</button>
                        <div className='flex items-center w-full justify-center gap-4'>
                            <hr className='border-gray-500 w-[40%]'></hr>
                            <span className='text-gray-500 float-center'>Or</span>
                            <hr className='border-gray-500 w-[40%]' />
                        </div>
                        <button type="button" className=' login-button login-new-button'>Create Account</button>
                    </div>
                </form>
                {message && <p>{message}</p>}
            </div>
            <img src="/logo.png" alt="logo" className='absolute top-4 left-0 w-[250px]' />
        </div>
    );
};

export default Login;