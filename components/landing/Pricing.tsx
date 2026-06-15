'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckIcon, StarIcon } from 'lucide-react';

import Badge from './Badge';

export default function Pricing() {
  const freeFeatures = [
    'Unlimited daily quests',
    'XP & level system',
    'Streak tracking',
    'Weekly charts',
    'Main dashboard access',
    'Interactive workspace layout',
  ];

  const premiumFeatures = [
    'Everything in Free',
    'Advanced multi-step strategies',
    'Strategic analytics engine',
    'PDF tactical log export',
    'XP multiplier 1.5x',
    'Commander status profile badge',
  ];

  return (
    <section
      id='pricing'
      className='py-16 sm:py-24 px-4 sm:px-6 bg-[#e9edc9] border-b-4 border-black'
    >
      <div className='max-w-4xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='text-center mb-10 sm:mb-14'
        >
          <Badge bg='bg-[#faedcd]'>
            <StarIcon size={10} />
            Pricing
          </Badge>

          <h2 className='text-3xl sm:text-4xl md:text-6xl font-oi uppercase mt-4 break-words leading-tight'>
            Simple pricing
          </h2>

          <p className='font-sans opacity-45 mt-2 text-xs sm:text-sm'>
            Start free. Upgrade when you are ready.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 max-w-3xl mx-auto items-start'>
          {/* FREE PLAN */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className='bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full'
          >
            <p className='text-xs uppercase opacity-40 tracking-widest mb-2 font-luckiest'>
              Free Forever
            </p>

            <p className='text-4xl sm:text-5xl font-oi mb-6 uppercase'>
              Free
            </p>

            <ul className='space-y-3 mb-8'>
              {freeFeatures.map((feature, index) => (
                <li
                  key={index}
                  className='flex items-start gap-2 text-sm font-sans'
                >
                  <div className='w-5 h-5 rounded-full border-2 border-black bg-[#ccd5ae] flex items-center justify-center flex-shrink-0 mt-0.5'>
                    <CheckIcon size={11} />
                  </div>

                  <span className='opacity-70 flex-1 break-words'>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link href='/sign-up'>
              <motion.div
                whileHover={{
                  scale: 1.02,
                  x: 3,
                  y: 3,
                  boxShadow: 'none',
                }}
                whileTap={{ scale: 0.98 }}
                className='w-full py-3.5 sm:py-4 bg-[#e9edc9] border-4 border-black rounded-2xl text-center uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer font-luckiest text-sm sm:text-base'
              >
                Start Free
              </motion.div>
            </Link>
          </motion.div>

          {/* PREMIUM PLAN */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className='bg-[#d4a373] border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full'
          >
            <div className='bg-black text-[#fefae0] text-center py-2.5 text-xs uppercase tracking-widest font-luckiest'>
              ⭐ Commander Tier
            </div>

            <div className='p-6 sm:p-8'>
              <p className='text-xs uppercase opacity-60 tracking-widest mb-2 font-luckiest'>
                Premium
              </p>

              <div className='flex items-end gap-1 mb-6'>
                <span className='text-4xl sm:text-5xl font-oi leading-none'>
                  $4.99
                </span>

                <span className='text-sm opacity-60 mb-1 font-luckiest'>
                  /mo
                </span>
              </div>

              <ul className='space-y-3 mb-8'>
                {premiumFeatures.map((feature, index) => (
                  <li
                    key={index}
                    className='flex items-start gap-2 text-sm font-sans'
                  >
                    <div className='w-5 h-5 rounded-full border-2 border-black bg-black/20 flex items-center justify-center flex-shrink-0 mt-0.5'>
                      <CheckIcon
                        size={11}
                        className='text-white'
                      />
                    </div>

                    <span className='opacity-90 flex-1 break-words'>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href='/premium'>
                <motion.div
                  whileHover={{
                    scale: 1.02,
                    x: 3,
                    y: 3,
                    boxShadow: 'none',
                  }}
                  whileTap={{ scale: 0.98 }}
                  className='w-full py-3.5 sm:py-4 bg-[#fefae0] border-4 border-black rounded-2xl text-center uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer font-luckiest text-sm sm:text-base'
                >
                  Go Premium
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}