'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  bg: string;
  iconBg: string;
}

export default function FeatureCard({
  icon,
  title,
  desc,
  bg,
  iconBg,
}: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`${bg} border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3 h-full`}
    >
      <div
        className={`w-12 h-12 ${iconBg} border-2 border-black rounded-xl flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>

      <h3 className='text-xl font-luckiest uppercase break-words'>
        {title}
      </h3>

      <p className='text-sm font-sans opacity-60 leading-relaxed break-words'>
        {desc}
      </p>
    </motion.div>
  );
}