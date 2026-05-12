'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlusIcon,
  LockIcon,
  MailIcon,
  UserIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const SignUpPage = () => {
  const { register } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    codename: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.codename.trim()) {
      setError('Codename required, Commander.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Secrets do not match. Try again.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Secret must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await register(
      formData.codename,
      formData.email,
      formData.password,
    );

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push('/');
  };

  return (
    <div className='min-h-screen bg-soft flex items-center justify-center p-6 font-luckiest text-foreground overflow-hidden'>
      <div className='fixed inset-0 pointer-events-none opacity-5'>
        <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-[120px]' />
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0, rotate: -1 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className='w-full max-w-5xl bg-white border-4 border-black rounded-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative z-10 overflow-hidden'
      >
        <div className='grid md:grid-cols-2'>
          {/* LEFT */}
          <div className='bg-[#fefae0] p-8 md:p-12 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col justify-center items-center text-center'>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className='inline-block bg-[#caffbf] p-6 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6'
            >
              <UserPlusIcon size={60} />
            </motion.div>
            <h1 className='text-4xl md:text-5xl font-oi uppercase tracking-tight mb-4 leading-tight'>
              Join the Unit
            </h1>
            <p className='text-light-bronze text-lg opacity-80 uppercase max-w-[280px]'>
              Create your profile to start tracking missions.
            </p>
          </div>

          {/* RIGHT */}
          <div className='p-8 md:p-10 flex flex-col justify-center bg-white'>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className='mb-4 text-center text-sm uppercase bg-[#ffadad] border-2 border-black p-2 rounded-xl'
              >
                {error}
              </motion.p>
            )}

            <form className='space-y-4' onSubmit={handleSignUp}>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='block uppercase text-lg ml-1'>
                    Codename
                  </label>
                  <div className='relative group'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <UserIcon size={18} />
                    </div>
                    <input
                      type='text'
                      placeholder='Ghost_Operator'
                      className='w-full bg-soft border-4 border-black p-3 pl-12 rounded-xl outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all'
                      value={formData.codename}
                      onChange={(e) =>
                        setFormData({ ...formData, codename: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='block uppercase text-lg ml-1'>
                    Secure Email
                  </label>
                  <div className='relative group'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <MailIcon size={18} />
                    </div>
                    <input
                      type='email'
                      placeholder='recruit@base.com'
                      className='w-full bg-soft border-4 border-black p-3 pl-12 rounded-xl outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all'
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='block uppercase text-lg ml-1'>Secret</label>
                  <div className='relative group'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <LockIcon size={18} />
                    </div>
                    <input
                      type='password'
                      placeholder='••••••'
                      className='w-full bg-soft border-4 border-black p-3 pl-12 rounded-xl outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all'
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='block uppercase text-lg ml-1'>
                    Confirm
                  </label>
                  <div className='relative group'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <ShieldCheckIcon size={18} />
                    </div>
                    <input
                      type='password'
                      placeholder='••••••'
                      className='w-full bg-soft border-4 border-black p-3 pl-12 rounded-xl outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all'
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <motion.button
                type='submit'
                disabled={loading}
                whileHover={
                  !loading ? { scale: 1.02, x: 4, y: 4, boxShadow: 'none' } : {}
                }
                whileTap={!loading ? { scale: 0.98 } : {}}
                className='w-full bg-[#ffd6a5] border-4 border-black py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3 text-2xl uppercase mt-4 cursor-pointer group disabled:opacity-60'
              >
                {loading ? (
                  'Enlisting...'
                ) : (
                  <>
                    Enlist Now{' '}
                    <ArrowRightIcon className='group-hover:translate-x-2 transition-transform' />
                  </>
                )}
              </motion.button>
            </form>

            <p className='text-center mt-8 text-sm uppercase opacity-80'>
              Already Enlisted?{' '}
              <Link
                href='/login'
                className='text-primary border-b-2 border-primary hover:text-secondary transition-all'
              >
                Back to Base
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
