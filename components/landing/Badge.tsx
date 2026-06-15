import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  bg?: string;
}

export default function Badge({
  children,
  bg = 'bg-[#ccd5ae]',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${bg} text-black border-2 border-black px-3 py-1 rounded-full text-xs uppercase tracking-widest font-luckiest`}
    >
      {children}
    </span>
  );
}