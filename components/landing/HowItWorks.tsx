'use client';

import { motion } from 'framer-motion';
import { ClockIcon } from 'lucide-react';

import Badge from './Badge';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Choose Codename',
      desc: 'Sign up in seconds. Claim your unique operational handle to begin your journey.',
      bg: 'bg-[#faedcd]',
    },
    {
      step: '02',
      title: 'Deploy Quests',
      desc: 'Populate your interactive workspace with strategic missions and prioritized tasks.',
      bg: 'bg-[#ccd5ae]',
    },
    {
      step: '03',
      title: 'Execute & Level',
      desc: 'Complete actions to rack up raw XP, advance your streak fires, and claim higher military ranks.',
      bg: 'bg-[#d4a373]',
    },
  ];

  return (
    <section className='py-16 sm:py-24 px-4 sm:px-6 bg-white border-b-4 border-black'>
      <div className='max-w-4xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='text-center mb-12 sm:mb-16'
        >
          <Badge bg='bg-[#e9edc9]'>
            <ClockIcon size={10} />
            How it works
          </Badge>

          <h2 className='text-3xl sm:text-4xl md:text-6xl font-oi uppercase mt-4'>
            Three steps
          </h2>
        </motion.div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 md:gap-8'>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className='text-center flex flex-col items-center'
            >
              <motion.div
                whileHover={{ rotate: [-2, 2, -2, 0] }}
                transition={{ duration: 0.4 }}
                className={`w-20 h-20 sm:w-24 sm:h-24 ${step.bg} border-4 border-black rounded-3xl flex items-center justify-center mb-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-3xl sm:text-4xl font-oi flex-shrink-0`}
              >
                {step.step}
              </motion.div>

              <h3 className='text-lg sm:text-xl uppercase mb-2 break-words w-full'>
                {step.title}
              </h3>

              <p className='font-sans text-xs sm:text-sm opacity-50 leading-relaxed max-w-[200px] mx-auto break-words'>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}