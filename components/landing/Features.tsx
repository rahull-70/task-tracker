'use client';

import { motion } from 'framer-motion';
import {
  LayoutDashboardIcon,
  FlameIcon,
  ZapIcon,
  BarChart3Icon,
  CompassIcon,
  TargetIcon,
} from 'lucide-react';

import Badge from './Badge';
import FeatureCard from './FeatureCard';

export default function Features() {
  const features = [
    {
      icon: <LayoutDashboardIcon size={22} />,
      title: 'Main Dashboard',
      desc: 'Track missions with priority levels, durations and status — all in one clean table.',
      bg: 'bg-white',
      iconBg: 'bg-[#faedcd]',
    },
    {
      icon: <FlameIcon size={22} className='text-orange-500' />,
      title: 'Streak System',
      desc: 'Build daily momentum. Complete quests every day to keep your fire alive.',
      bg: 'bg-[#ffadad]/60',
      iconBg: 'bg-white',
    },
    {
      icon: <ZapIcon size={22} />,
      title: 'XP & Levels',
      desc: 'Earn XP per quest. Rise through 10 ranks — Rookie all the way to Commandant.',
      bg: 'bg-white',
      iconBg: 'bg-[#ccd5ae]',
    },
    {
      icon: <BarChart3Icon size={22} />,
      title: 'Stat Center',
      desc: 'Weekly, monthly and yearly performance charts built from your real quest data.',
      bg: 'bg-[#ccd5ae]/70',
      iconBg: 'bg-white',
    },
    {
      icon: <CompassIcon size={22} />,
      title: 'Strategies',
      desc: 'Schedule core missions, bookmark critical deadlines, and layout comprehensive multi-step strategies.',
      bg: 'bg-white',
      iconBg: 'bg-[#faedcd]',
    },
    {
      icon: <TargetIcon size={22} />,
      title: 'Focus Arc',
      desc: 'Pomodoro-style focus timer with iOS drum-scroll time picker and Spotify integration.',
      bg: 'bg-[#e9edc9]/80',
      iconBg: 'bg-white',
    },
  ];

  return (
    <section
      id='features'
      className='py-16 sm:py-24 px-4 sm:px-6 bg-[#faedcd] border-y-4 border-black'
    >
      <div className='max-w-6xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='text-center mb-10 sm:mb-14'
        >
          <Badge bg='bg-white'>
            <TargetIcon size={10} />
            Features
          </Badge>

          <h2 className='text-3xl sm:text-4xl md:text-6xl font-oi uppercase mt-4 break-words leading-tight'>
            Everything you need
          </h2>

          <p className='font-sans opacity-45 mt-3 max-w-sm mx-auto text-xs sm:text-sm px-4'>
            Built for people who take their goals seriously.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}