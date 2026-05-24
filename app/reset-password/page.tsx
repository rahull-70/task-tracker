'use client';
import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { LockIcon, ShieldCheckIcon, ArrowRightIcon, CheckIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) setError('Invalid reset link. Request a new one.');
  }, [token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Reset failed.');
      return;
    }

    setDone(true);
    setTimeout(() => router.push('/login'), 3000);
  };

  return (
    <div className='min-h-screen bg-[#fefae0] flex items-center justify-center p-6 font-luckiest'>
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#d4a373]/10 rounded-full blur-[120px]' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ccd5ae]/20 rounded-full blur-[120px]' />
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0, rotate: -1 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className='w-full max-w-4xl bg-white border-4 border-black rounded-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative z-10'
      >
        <div className='grid md:grid-cols-2'>

          {/* LEFT */}
          <div className='bg-[#faedcd] p-8 md:p-12 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col justify-center items-center text-center'>
            <motion.div
              animate={done ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
              className={`inline-block p-6 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 ${done ? 'bg-[#ccd5ae]' : 'bg-[#d4a373]'}`}
            >
              {done ? <CheckIcon size={60} /> : <ShieldCheckIcon size={60} />}
            </motion.div>
            <h1 className='text-4xl md:text-5xl font-oi uppercase tracking-tight mb-4'>
              {done ? 'Reset!' : 'New Secret'}
            </h1>
            <p className='text-[#d4a373] text-lg opacity-80 uppercase max-w-[240px]'>
              {done
                ? 'Redirecting to base in 3 seconds...'
                : 'Set a new password for your commander account.'}
            </p>
          </div>

          {/* RIGHT */}
          <div className='p-8 md:p-10 flex flex-col justify-center bg-white'>

            {done ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className='text-center space-y-4'>
                <div className='w-20 h-20 bg-[#ccd5ae] border-4 border-black rounded-2xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
                  <CheckIcon size={40} />
                </div>
                <h2 className='text-2xl uppercase'>Password Updated</h2>
                <p className='font-sans text-sm opacity-50 uppercase'>Redirecting to login...</p>
                <Link href='/login'>
                  <motion.div whileHover={{ scale: 1.02, x: 3, y: 3, boxShadow: 'none' }}
                    className='w-full bg-[#d4a373] border-4 border-black py-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center uppercase cursor-pointer mt-4'>
                    Go to Login
                  </motion.div>
                </Link>
              </motion.div>
            ) : (
              <>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className='mb-4 flex items-center gap-2 bg-[#ffadad] border-2 border-black p-3 rounded-xl'>
                    <XIcon size={16} className='flex-shrink-0' />
                    <p className='text-sm uppercase'>{error}</p>
                  </motion.div>
                )}

                {!token ? (
                  <div className='text-center space-y-4'>
                    <p className='opacity-50 uppercase text-sm'>This link is invalid or expired.</p>
                    <Link href='/login'>
                      <motion.div whileHover={{ scale: 1.02 }}
                        className='w-full bg-[#faedcd] border-4 border-black py-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center uppercase cursor-pointer'>
                        Request New Link
                      </motion.div>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleReset} className='space-y-5'>
                    <div className='space-y-2'>
                      <label className='block uppercase text-lg ml-1'>New Secret</label>
                      <div className='relative group'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <LockIcon size={18} className='group-focus-within:text-[#d4a373] transition-colors' />
                        </div>
                        <input
                          type='password'
                          placeholder='••••••'
                          className='w-full bg-[#fefae0] border-4 border-black p-3 pl-12 rounded-xl outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all'
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <label className='block uppercase text-lg ml-1'>Confirm Secret</label>
                      <div className='relative group'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <ShieldCheckIcon size={18} className='group-focus-within:text-[#d4a373] transition-colors' />
                        </div>
                        <input
                          type='password'
                          placeholder='••••••'
                          className='w-full bg-[#fefae0] border-4 border-black p-3 pl-12 rounded-xl outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all'
                          value={confirm}
                          onChange={e => setConfirm(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Password strength indicator */}
                    {password.length > 0 && (
                      <div className='space-y-1'>
                        <div className='flex gap-1'>
                          {[1, 2, 3, 4].map(level => (
                            <div key={level}
                              className={`h-1.5 flex-1 rounded-full border border-black/20 transition-all ${
                                password.length >= level * 3
                                  ? level <= 1 ? 'bg-[#ffadad]'
                                  : level <= 2 ? 'bg-[#ffd6a5]'
                                  : level <= 3 ? 'bg-[#faedcd]'
                                  : 'bg-[#ccd5ae]'
                                  : 'bg-gray-100'
                              }`}
                            />
                          ))}
                        </div>
                        <p className='text-xs opacity-40 uppercase'>
                          {password.length < 4 ? 'Too short' : password.length < 7 ? 'Weak' : password.length < 10 ? 'Good' : 'Strong'}
                        </p>
                      </div>
                    )}

                    <motion.button
                      type='submit'
                      disabled={loading}
                      whileHover={!loading ? { scale: 1.02, x: 4, y: 4, boxShadow: 'none' } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                      className='w-full bg-[#d4a373] border-4 border-black py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3 text-xl uppercase mt-2 cursor-pointer group disabled:opacity-60'
                    >
                      {loading ? 'Updating...' : <>Set New Password <ArrowRightIcon className='group-hover:translate-x-2 transition-transform' /></>}
                    </motion.button>
                  </form>
                )}

                <p className='text-center mt-6 text-sm opacity-60 uppercase'>
                  <Link href='/login' className='border-b-2 border-black/30 hover:border-black transition-colors'>
                    ← Back to login
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className='min-h-screen bg-[#fefae0] flex items-center justify-center font-luckiest text-2xl uppercase'>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}