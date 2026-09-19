'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboardIcon,
  UserIcon,
  LogOutIcon,
  ChevronDownIcon,
  CompassIcon,
  ShieldCheckIcon,
  FileTextIcon,
  FocusIcon,
  FolderKanbanIcon,
  CrownIcon,
} from 'lucide-react';

interface NavbarProps {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: any;
  logout: () => Promise<void>;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Navbar({
  isLoggedIn,
  isLoading,
  user,
  logout,
  dropdownOpen,
  setDropdownOpen,
}: NavbarProps) {
  // Matched order: Dashboard -> Workspace -> Strategies -> Focus -> Premium
  const mainNavLinks = [
    ['Dashboard', '/board'],
    ['Workspace', '/workspace'],
    ['Strategies', '/strategies'],
    ['Focus', '/focus'],
    ['Premium', '/premium'],
  ];

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b-4 border-black'>
      <div className='max-w-6xl mx-auto flex items-center justify-between px-4 py-3 min-h-[68px] gap-4'>
        <Link href='/' className='flex-shrink-0'>
       <img src="/logo.png" alt=""  className='w-15'/>
        </Link>

        {/* Center Desktop Navigation */}
        <div className='hidden lg:flex items-center gap-5 text-sm uppercase font-luckiest text-black/70 flex-shrink'>
          {mainNavLinks.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className='hover:text-black transition-colors whitespace-nowrap'
            >
              {label}
            </Link>
          ))}
        </div>

        {/* ── AUTH BUTTONS ──*/}
        <div className='flex items-center gap-2 flex-shrink-0 relative min-h-[40px]'>

          {/* Guest buttons */}
          <motion.div
            initial={false}
            animate={{ opacity: isLoggedIn && !isLoading ? 0 : 1 }}
            transition={{ duration: 0.15 }}
            className={`flex items-center gap-2 ${isLoggedIn && !isLoading ? 'pointer-events-none absolute inset-0' : ''}`}
          >
            <Link href='/login'>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className='px-2.5 sm:px-4 py-2 border-4 border-black rounded-xl bg-[#fefae0] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs sm:text-sm uppercase cursor-pointer whitespace-nowrap font-luckiest'
              >
                Sign In
              </motion.div>
            </Link>
            <Link href='/sign-up'>
              <motion.div
                whileHover={{ scale: 1.04, x: 2, y: 2, boxShadow: 'none' }}
                whileTap={{ scale: 0.96 }}
                className='px-2.5 sm:px-4 py-2 border-4 border-black rounded-xl bg-[#d4a373] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs sm:text-sm uppercase cursor-pointer whitespace-nowrap font-luckiest'
              >
                Get Started
              </motion.div>
            </Link>
          </motion.div>

          {/* Logged-in buttons */}
          {!isLoading && isLoggedIn && user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className='flex items-center gap-2'
            >
              <Link href='/board' className='hidden sm:block'>
                <motion.div
                  whileHover={{ scale: 1.04, x: 2, y: 2, boxShadow: 'none' }}
                  whileTap={{ scale: 0.96 }}
                  className='inline-flex items-center gap-1.5 px-4 py-2 border-4 border-black rounded-xl bg-[#ccd5ae] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-sm uppercase cursor-pointer whitespace-nowrap font-luckiest'
                >
                  <LayoutDashboardIcon size={14} />
                  Board
                </motion.div>
              </Link>

              <div className='relative'>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setDropdownOpen((o) => !o)}
                  className='flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 border-4 border-black rounded-xl bg-[#faedcd] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs sm:text-sm uppercase font-luckiest cursor-pointer max-w-[140px] sm:max-w-[200px]'
                >
                  <div className='w-5 h-5 rounded-lg bg-[#d4a373] border-2 border-black flex items-center justify-center flex-shrink-0'>
                    <UserIcon size={12} />
                  </div>
                  <span className='truncate font-black tracking-tight flex-1 text-left'>
                    {user.codename}
                  </span>
                  <ChevronDownIcon
                    size={13}
                    className={`transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </motion.button>

                {dropdownOpen && (
                  <>
                    <div className='fixed inset-0 z-40' onClick={() => setDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className='absolute right-0 mt-2 w-56 bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden font-luckiest'
                    >
                      <div className='p-4 border-b-2 border-black bg-[#fefae0]'>
                        <p className='text-[10px] opacity-40 uppercase tracking-wider font-sans font-bold'>
                          Logged in as
                        </p>
                        <p className='text-sm uppercase font-black truncate mt-0.5'>{user.codename}</p>
                        <p className='text-[10px] opacity-50 font-sans truncate'>{user.email}</p>
                      </div>

                      <div className='max-h-80 overflow-y-auto'>
                        <Link href='/board' onClick={() => setDropdownOpen(false)}
                          className='flex items-center gap-2 px-4 py-2.5 text-xs uppercase hover:bg-[#ccd5ae]/30 border-b border-black/10 transition-colors text-black/70 hover:text-black'>
                          <LayoutDashboardIcon size={14} />
                          Go to Board
                        </Link>
                        <Link href='/workspace' onClick={() => setDropdownOpen(false)}
                          className='flex items-center gap-2 px-4 py-2.5 text-xs uppercase hover:bg-[#faedcd]/30 border-b border-black/10 transition-colors text-black/70 hover:text-black'>
                          <FolderKanbanIcon size={14} />
                          My Workspace
                        </Link>
                        <Link href='/strategies' onClick={() => setDropdownOpen(false)}
                          className='flex items-center gap-2 px-4 py-2.5 text-xs uppercase hover:bg-[#e9edc9]/30 border-b border-black/10 transition-colors text-black/70 hover:text-black'>
                          <CompassIcon size={14} />
                          Strategies
                        </Link>
                        <Link href='/focus' onClick={() => setDropdownOpen(false)}
                          className='flex items-center gap-2 px-4 py-2.5 text-xs uppercase hover:bg-[#fefae0] border-b border-black/10 transition-colors text-black/70 hover:text-black'>
                          <FocusIcon size={14} />
                          Focus Mode
                        </Link>
                        <Link href='/premium' onClick={() => setDropdownOpen(false)}
                          className='flex items-center gap-2 px-4 py-2.5 text-xs uppercase hover:bg-[#d4a373]/30 border-b border-black/10 transition-colors text-black/70 hover:text-black'>
                          <CrownIcon size={14} />
                          Premium
                        </Link>
                        <Link href='/user' onClick={() => setDropdownOpen(false)}
                          className='flex items-center gap-2 px-4 py-2.5 text-xs uppercase hover:bg-[#faedcd]/50 border-b border-black/10 transition-colors text-black/70 hover:text-black'>
                          <UserIcon size={14} />
                          My Profile
                        </Link>
                        <Link href='/terms' onClick={() => setDropdownOpen(false)}
                          className='flex items-center gap-2 px-4 py-2.5 text-xs uppercase hover:bg-gray-100 border-b border-black/10 transition-colors text-black/70 hover:text-black'>
                          <FileTextIcon size={14} />
                          Terms
                        </Link>
                        <Link href='/privacy-policy' onClick={() => setDropdownOpen(false)}
                          className='flex items-center gap-2 px-4 py-2.5 text-xs uppercase hover:bg-gray-100 border-b border-black/10 transition-colors text-black/70 hover:text-black'>
                          <ShieldCheckIcon size={14} />
                          Privacy Policy
                        </Link>
                      </div>

                      <button
                        onClick={async () => { setDropdownOpen(false); await logout(); }}
                        className='w-full flex items-center gap-2 px-4 py-3 text-xs uppercase text-red-500 hover:bg-red-50 transition-colors font-luckiest border-t-2 border-black'
                      >
                        <LogOutIcon size={14} />
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
}