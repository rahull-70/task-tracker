'use client';

import Link from 'next/link';

export default function Footer() {
  const footerLinks = [
    ['App', '/board'],
    ['Strategies', '/strategies'],
    ['Workspace', '/workspace'],
    ['Focus', '/focus'],
    ['Premium', '/premium'],
    ['Terms', '/terms'],
    ['Privacy', '/privacy'],
    ['Login', '/login'],
  ];

  return (
    <footer className='border-t-4 border-black bg-[#fefae0] px-4 sm:px-6 py-8'>
      <div className='max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4'>
        <span className='text-2xl font-oi uppercase flex-shrink-0'>
          QuestBoard
        </span>

        <div className='flex flex-wrap justify-center items-center gap-x-5 gap-y-2.5 text-xs uppercase opacity-40 font-luckiest'>
          {footerLinks.map(
            ([label, href]) => (
              <Link
                key={label}
                href={href}
                className='hover:opacity-100 transition-opacity whitespace-nowrap'
              >
                {label}
              </Link>
            )
          )}
        </div>

        <p className='font-sans text-xs opacity-25 text-center md:text-right flex-shrink-0'>
          &copy; 2026 QuestBoard. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}