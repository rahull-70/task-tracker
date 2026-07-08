'use client';
import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn as LogInIcon,
  Lock as LockIcon,
  MailIcon,
  ArrowRight as ArrowRightIcon,
  HelpCircle as HelpIcon,
  ArrowLeft as ArrowLeftIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const LoginForm = () => {
  const { login, resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setMode(mode === 'login' ? 'forgot' : 'login');
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Redirect to ?from= param or /board (never back to landing page)
    const from = searchParams.get('from') || '/board';
    router.push(from);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!resetPassword) {
      setError('Password reset is not configured.');
      setLoading(false);
      return;
    }

    const result = await resetPassword(email);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess('Recovery link sent. Check your email.');
    setLoading(false);
  };

  return (
    <div className='min-h-screen bg-soft flex items-center justify-center p-4 md:p-6 font-luckiest text-foreground overflow-hidden'>
      <div className='fixed inset-0 pointer-events-none opacity-5'>
        <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[120px]' />
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0, rotate: -1 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className='w-full max-w-5xl bg-white border-4 border-black rounded-2xl md:rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative z-10 overflow-hidden'
      >
        <div className='grid grid-cols-1 md:grid-cols-2'>

          {/* LEFT PANEL */}
          <div className='bg-[#fefae0] p-8 md:p-12 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col justify-center items-center text-center'>
            <AnimatePresence mode='wait'>
              {mode === 'login' ? (
                <motion.div key='login-left' initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  className='flex flex-col items-center'>
                  <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}
                    className='inline-block bg-primary p-6 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6'>
                    <LogInIcon size={60} className='text-white' />
                  </motion.div>
                  <h1 className='text-4xl md:text-5xl font-oi uppercase tracking-tight mb-4 leading-tight'>Deploy</h1>
                  <p className='text-light-bronze text-lg md:text-xl opacity-80 uppercase max-w-[250px]'>
                    Enter your credentials, Commander.
                  </p>
                </motion.div>
              ) : (
                <motion.div key='forgot-left' initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  className='flex flex-col items-center'>
                  <motion.div whileHover={{ scale: 1.1 }}
                    className='inline-block bg-secondary p-6 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6'>
                    <HelpIcon size={60} className='text-white' />
                  </motion.div>
                  <h1 className='text-4xl md:text-5xl font-oi uppercase tracking-tight mb-4 leading-tight'>Recover</h1>
                  <p className='text-light-bronze text-lg md:text-xl opacity-80 uppercase max-w-[260px]'>
                    Requesting a credential bypass stream.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT PANEL */}
          <div className='p-6 md:p-10 flex flex-col justify-center bg-white'>

            {/* Status Messages */}
            <AnimatePresence mode='wait'>
              {error && (
                <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className='mb-4 text-center text-sm uppercase bg-[#ffadad] border-2 border-black p-2 rounded-xl'>
                  {error}
                </motion.p>
              )}
              {success && (
                <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className='mb-4 text-center text-sm uppercase bg-[#caffbf] border-2 border-black p-2 rounded-xl'>
                  {success}
                </motion.p>
              )}
            </AnimatePresence>

            <AnimatePresence mode='wait'>
              {mode === 'login' ? (
                <motion.div key='login-form' initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  <form className='space-y-4' onSubmit={handleLogin}>
                    <div className='space-y-2'>
                      <label className='block uppercase text-lg ml-1'>Identity (Email)</label>
                      <div className='relative group'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <MailIcon size={18} className='group-focus-within:text-primary transition-colors' />
                        </div>
                        <input type='email'
                          className='w-full bg-soft border-4 border-black p-3 pl-12 rounded-xl outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all'
                          value={email} onChange={e => setEmail(e.target.value)} required />
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex justify-between items-end mx-1'>
                        <label className='block uppercase text-lg'>Secret (Password)</label>
                        <button type='button' onClick={toggleMode}
                          className='text-sm uppercase opacity-70 hover:opacity-100 border-b-2 border-transparent hover:border-black cursor-pointer'>
                          Forgot?
                        </button>
                      </div>
                      <div className='relative group'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <LockIcon size={18} className='group-focus-within:text-primary transition-colors' />
                        </div>
                        <input type='password'
                          className='w-full bg-soft border-4 border-black p-3 pl-12 rounded-xl outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all'
                          value={password} onChange={e => setPassword(e.target.value)} required />
                      </div>
                    </div>

                    <motion.button type='submit' disabled={loading}
                      whileHover={!loading ? { scale: 1.02, x: 4, y: 4, boxShadow: 'none' } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                      className='w-full bg-[#ffd6a5] border-4 border-black py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3 text-xl uppercase mt-4 cursor-pointer group disabled:opacity-60'>
                      {loading ? 'Authenticating...' : <>Authenticate <ArrowRightIcon className='group-hover:translate-x-2 transition-transform' /></>}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div key='forgot-form' initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  <form className='space-y-4' onSubmit={handleForgotPassword}>
                    <div className='space-y-2'>
                      <label className='block uppercase text-lg ml-1'>Registered Identity (Email)</label>
                      <div className='relative group'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <MailIcon size={18} className='group-focus-within:text-secondary transition-colors' />
                        </div>
                        <input type='email' placeholder='commander@fleet.com'
                          className='w-full bg-soft border-4 border-black p-3 pl-12 rounded-xl outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all'
                          value={email} onChange={e => setEmail(e.target.value)} required />
                      </div>
                    </div>

                    <motion.button type='submit' disabled={loading}
                      whileHover={!loading ? { scale: 1.02, x: 4, y: 4, boxShadow: 'none' } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                      className='w-full bg-[#9bf6ff] border-4 border-black py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3 text-xl uppercase mt-4 cursor-pointer group disabled:opacity-60'>
                      {loading ? 'Sending...' : <>Send Reset Link <ArrowRightIcon className='group-hover:translate-x-2 transition-transform' /></>}
                    </motion.button>

                    <button type='button' onClick={toggleMode}
                      className='w-full text-center uppercase text-sm opacity-70 hover:opacity-100 flex items-center justify-center gap-2 mt-2 cursor-pointer'>
                      <ArrowLeftIcon size={14} /> Back to login
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom prompt — fixed /sign-in → /sign-up */}
            <p className='text-center mt-8 text-sm opacity-80 uppercase'>
              New Recruit?{' '}
              <Link href='/sign-up' className='text-primary border-b-2 border-primary hover:text-secondary hover:border-secondary'>
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className='min-h-screen bg-soft flex items-center justify-center font-luckiest text-xl uppercase'>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}