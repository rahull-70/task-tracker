'use client';

import { motion, MotionValue } from 'framer-motion';
import Link from 'next/link';
import { ArrowRightIcon, ZapIcon } from 'lucide-react';

import Badge from './Badge';
import CommandMenu from '@/components/ui/CommandMenu';

interface HeroProps {
  heroRef: React.RefObject<HTMLElement | null>;
  y: MotionValue<number>;
  isLoggedIn: boolean;
  user: any;
}

export default function Hero({
  heroRef,
  y,
  isLoggedIn,
  user,
}: HeroProps) {
  return (
    <section
      ref={heroRef}
      className='min-h-screen bg-[#fefae0] flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-24 pb-12 relative overflow-hidden'
    >
      <CommandMenu />

      {/* Background Blobs */}
      <div className='absolute top-32 left-16 w-56 h-56 bg-[#d4a373]/15 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute bottom-24 right-16 w-64 h-64 bg-[#ccd5ae]/25 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute top-1/3 left-1/3 w-32 h-32 bg-[#faedcd]/40 rounded-full blur-2xl pointer-events-none' />

      <motion.div
        style={{ y }}
        className='relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center mt-8 sm:mt-0'
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Badge bg='bg-white'>
            <ZapIcon size={10} />
            Track · Complete · Level Up
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='text-6xl md:text-8xl lg:text-[10rem] font-oi uppercase content-title-scale mt-6 mb-6 tracking-tight w-full break-words leading-[0.95]'
        >
          Quest
          <br />
          Board
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='text-xs sm:text-sm md:text-xl font-sans opacity-60 max-w-md mx-auto mb-8 sm:mb-10 leading-relaxed px-2'
        >
          {isLoggedIn && user
            ? `Welcome back, ${user.codename}. Your missions await.`
            : 'Turn your daily tasks into missions. Earn XP, build streaks, and level up — one quest at a time.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className='flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xs sm:max-w-none px-4 sm:px-0'
        >
          <Link
            href={isLoggedIn ? '/board' : '/sign-up'}
            className='w-full sm:w-auto'
          >
            <motion.div
              whileHover={{
                scale: 1.05,
                x: 4,
                y: 4,
                boxShadow: 'none',
              }}
              whileTap={{ scale: 0.95 }}
              className='flex items-center justify-center gap-2 bg-[#d4a373] border-4 border-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-lg sm:text-xl uppercase cursor-pointer whitespace-nowrap'
            >
              {isLoggedIn ? 'Enter Board' : 'Start Free'}
              <ArrowRightIcon size={20} />
            </motion.div>
          </Link>

          {!isLoggedIn && (
            <Link
              href='/board'
              className='w-full sm:w-auto'
            >
              <motion.div
                whileHover={{
                  scale: 1.05,
                  x: 4,
                  y: 4,
                  boxShadow: 'none',
                }}
                whileTap={{ scale: 0.95 }}
                className='flex items-center justify-center gap-2 bg-white border-4 border-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-lg sm:text-xl uppercase cursor-pointer whitespace-nowrap'
              >
                Open App
              </motion.div>
            </Link>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className='text-[10px] uppercase tracking-widest opacity-25 mt-5 font-luckiest'
        >
          Press ⌘K to navigate
        </motion.p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className='relative z-10 mt-10 sm:mt-14 grid grid-cols-3 gap-2.5 sm:gap-4 w-full max-w-md mx-auto px-2'
      >
        {[
          ['10K+', 'Quests Done'],
          ['500+', 'Commanders'],
          ['98%', 'Satisfaction'],
        ].map(([val, label], i) => (
          <div
            key={i}
            className='bg-white border-2 sm:border-4 border-black rounded-2xl p-2.5 sm:p-4 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-0'
          >
            <p className='text-base sm:text-2xl md:text-3xl truncate font-luckiest'>
              {val}
            </p>

            <p className='text-[8px] sm:text-[10px] opacity-45 uppercase tracking-wide font-sans mt-0.5 line-clamp-2 leading-tight'>
              {label}
            </p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}