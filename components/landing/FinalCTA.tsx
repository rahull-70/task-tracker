'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  StarIcon,
} from 'lucide-react';

interface FinalCTAProps {
  isLoggedIn: boolean;
}

export default function FinalCTA({
  isLoggedIn,
}: FinalCTAProps) {
  return (
    <section className='py-20 sm:py-28 px-4 sm:px-6 bg-[#d4a373] border-b-4 border-black'>
      <div className='max-w-3xl mx-auto text-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className='text-4xl sm:text-6xl md:text-8xl font-oi uppercase mb-5 leading-[0.95] break-words tracking-tight w-full'>
            Ready
            <br />
            Commander?
          </h2>

          <p className='font-sans opacity-65 mb-8 sm:mb-10 text-base sm:text-lg max-w-md mx-auto px-2 break-words'>
            {isLoggedIn
              ? 'Your tactical missions are waiting inside your workspace.'
              : 'Join hundreds of commanders crushing their daily missions.'}
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-xs sm:max-w-none mx-auto px-4 sm:px-0'>
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
                className='w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#fefae0] border-4 border-black px-6 sm:px-10 py-4 sm:py-5 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-xl sm:text-2xl uppercase cursor-pointer whitespace-nowrap'
              >
                {isLoggedIn
                  ? 'Enter Board'
                  : 'Start Free'}

                <ArrowRightIcon size={24} />
              </motion.div>
            </Link>

            {!isLoggedIn && (
              <Link
                href='/premium'
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
                  className='w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-black text-[#fefae0] border-4 border-black px-6 sm:px-10 py-4 sm:py-5 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-xl sm:text-2xl uppercase cursor-pointer whitespace-nowrap'
                >
                  <StarIcon size={22} />
                  Go Premium
                </motion.div>
              </Link>
            )}
          </div>

          <p className='font-sans text-[10px] sm:text-xs opacity-40 mt-5 uppercase tracking-widest'>
            Free forever · No credit card needed
          </p>
        </motion.div>
      </div>
    </section>
  );
}