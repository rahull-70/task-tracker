'use client';

import Link from 'next/link';

export default function Footer() {
  const navLinks = [
    ['Board', '/board'],
    ['Workspace', '/workspace'],
    ['Strategies', '/strategies'],
    ['Focus', '/focus'],
    ['Premium', '/premium'],
  ];

  const legalLinks = [
    ['Terms', '/terms'],
    ['Privacy & Policy', '/privacy-policy'],
    ['Login', '/login'],
  ];

  return (
    <footer className='border-t-4 border-black bg-[#fefae0] px-4 sm:px-6 py-10'>
      <div className='max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8'>
        {/* Brand Identity */}
        <div className='flex flex-col items-center md:items-start gap-2 flex-shrink-0'>
          <span className='text-3xl font-oi uppercase tracking-wide'>
            QuestBoard
          </span>
          <p className='font-sans text-xs opacity-40 text-center md:text-left hidden md:block'>
            &copy; 2026 QuestBoard. All rights reserved.
          </p>
        </div>

        {/* Links Categories */}
        <div className='flex flex-col sm:flex-row items-center sm:items-start gap-8 md:gap-16 text-center sm:text-left'>
          {/* Main Navigation */}
          <div className='flex flex-col gap-2.5'>
            <span className='font-sans text-[10px] uppercase opacity-40 font-bold'>
              Explore
            </span>
            <div className='flex flex-col sm:flex-row flex-wrap justify-center sm:justify-start items-center gap-x-6 gap-y-2 text-sm uppercase font-luckiest text-black/70'>
              {navLinks.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className='hover:text-black transition-colors whitespace-nowrap'
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal & Account */}
          <div className='flex flex-col gap-2.5'>
            <span className='font-sans text-[10px] uppercase opacity-40 font-bold'>
              System
            </span>
            <div className='flex flex-col sm:flex-row flex-wrap justify-center sm:justify-start items-center gap-x-6 gap-y-2 text-sm uppercase font-luckiest text-black/50'>
              {legalLinks.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className='hover:text-black transition-colors whitespace-nowrap'
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Copyright */}
        <p className='font-sans text-xs opacity-40 text-center md:hidden'>
          &copy; 2026 QuestBoard. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
