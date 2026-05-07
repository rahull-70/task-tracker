'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogInIcon, LockIcon, MailIcon, ArrowRightIcon } from 'lucide-react';
import { FaGithub, FaGoogle } from "react-icons/fa";
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // ← new
import { useAuth } from '@/context/AuthContext'; // ← new

const LoginPage = () => {
  const { login } = useAuth();   // ← new
  const router = useRouter();    // ← new

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // ← new: shows wrong password msg

  // ── SUBMIT HANDLER ────────────────────────────────────────────────────────
  // Checks email+password against the account saved in localStorage by SignUp.
  // No backend needed — everything lives in the browser.
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const raw = localStorage.getItem('registered_user');
    if (!raw) {
      setError('No account found. Please create one first.');
      return;
    }

    const saved = JSON.parse(raw);

    if (saved.email !== email || saved.password !== password) {
      setError('Wrong identity or secret. Try again.');
      return;
    }

    // Credentials match → log in and go home
    login({ codename: saved.codename, email: saved.email });
    router.push('/');
  };

  return (
    <div className='min-h-screen bg-soft flex items-center justify-center p-6 font-luckiest text-foreground overflow-hidden'>
      {/* BACKGROUND DECORATION */}
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
          
          {/* LEFT SIDE: LOGO & WELCOME */}
          <div className='bg-[#fefae0] p-8 md:p-12 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col justify-center items-center text-center'>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className='inline-block bg-primary p-6 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6'
            >
              <LogInIcon size={60} className='text-white' />
            </motion.div>
            <h1 className='text-5xl md:text-6xl font-oi uppercase tracking-tight mb-4'>
              Deploy
            </h1>
            <p className='text-light-bronze text-xl opacity-80 uppercase max-w-[250px]'>
              Enter your credentials, Commander.
            </p>
          </div>

          {/* RIGHT SIDE: FORM & SOCIALS */}
          <div className='p-8 md:p-10 flex flex-col justify-center'>
            {/* ── ERROR MESSAGE (only visible on bad login) ── */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className='mb-4 text-center text-sm uppercase bg-[#ffadad] border-2 border-black p-2 rounded-xl'
              >
                {error}
              </motion.p>
            )}

            <form className='space-y-4' onSubmit={handleLogin}> {/* ← onSubmit wired */}
              <div className='space-y-2'>
                <label className='block uppercase text-lg ml-1'>Identity (Email)</label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <MailIcon size={18} className='group-focus-within:text-primary transition-colors' />
                  </div>
                  <input
                    type='email'
                    placeholder='commander@quest.com'
                    className='w-full bg-soft border-4 border-black p-3 pl-12 rounded-xl outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:opacity-30'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <label className='block uppercase text-lg ml-1'>Secret (Password)</label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <LockIcon size={18} className='group-focus-within:text-primary transition-colors' />
                  </div>
                  <input
                    type='password'
                    placeholder='••••••••'
                    className='w-full bg-soft border-4 border-black p-3 pl-12 rounded-xl outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:opacity-30'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <motion.button
                type='submit' // ← was missing
                whileHover={{ scale: 1.02, x: 4, y: 4, boxShadow: 'none' }}
                whileTap={{ scale: 0.98 }}
                className='w-full bg-[#ffd6a5] border-4 border-black py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3 text-xl uppercase mt-4 cursor-pointer group'
              >
                Authenticate{' '}
                <ArrowRightIcon className='group-hover:translate-x-2 transition-transform' />
              </motion.button>
            </form>

            {/* SOCIAL AUTH */}
            <div className='grid grid-cols-2 gap-4 mt-8'>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                className='flex items-center justify-center gap-2 border-4 border-black p-2 rounded-xl hover:bg-[#fefae0] transition-colors cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase text-sm'
              >
                <FaGithub size={18} /> Github
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                className='flex items-center justify-center gap-2 border-4 border-black p-2 rounded-xl hover:bg-[#fefae0] transition-colors cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase text-sm'
              >
                <FaGoogle size={18} /> Google
              </motion.button>
            </div>

            {/* FOOTER */}
            <p className='text-center mt-8 text-sm opacity-80 uppercase'>
              New Recruit?{' '}
              <Link
                href='/sign-in'
                className='text-primary border-b-2 border-primary hover:text-secondary hover:border-secondary transition-colors'
              >
                Create Account
              </Link>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;