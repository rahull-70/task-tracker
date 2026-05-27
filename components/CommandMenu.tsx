'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboardIcon,
  CalendarIcon,
  ClipboardListIcon,
  LibraryIcon,
  TimerIcon,
  ShieldAlertIcon,
  ScaleIcon,
  ShieldCheckIcon,
} from 'lucide-react';

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  const SHORTCUTS = [
    {
      name: 'Board Grid',
      path: '/board',
      icon: <LayoutDashboardIcon size={14} />,
      color: 'bg-[#ccd5ae]',
    },
    {
      name: 'Strategies',
      path: '/strategies',
      icon: <CalendarIcon size={14} />,
      color: 'bg-[#faedcd]',
    }, // Merged Plans + Calendar
    {
      name: 'Workspace',
      path: '/workspace',
      icon: <LibraryIcon size={14} />,
      color: 'bg-[#ffd6a5]',
    }, // Merged Notes + Vault
    {
      name: 'Focus Arcade',
      path: '/focus',
      icon: <TimerIcon size={14} />,
      color: 'bg-[#ffadad]',
    },
    {
      name: 'Go Premium',
      path: '/premium',
      icon: <ShieldAlertIcon size={14} />,
      color: 'bg-[#d4a373] text-white',
    },
    {
      name: 'Terms of Service',
      path: '/terms',
      icon: <ScaleIcon size={14} />,
      color: 'bg-[#e5e5e5]',
    },
    {
      name: 'Privacy Policy',
      path: '/privacy',
      icon: <ShieldCheckIcon size={14} />,
      color: 'bg-[#e5e5e5]',
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 font-luckiest'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className='absolute inset-0 bg-black/40 backdrop-blur-sm'
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className='bg-white border-4 border-black w-full max-w-md rounded-3xl p-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative z-10 space-y-3 max-h-[85vh] overflow-y-auto'
          >
            <div className='border-b-2 border-black/10 pb-2 flex justify-between items-center px-1 sticky top-0 bg-white z-20'>
              <span className='text-xs uppercase opacity-40 tracking-wider font-luckiest'>
                Command Terminal
              </span>
              <kbd className='bg-black text-white px-1.5 py-0.5 rounded-md text-[9px] uppercase tracking-normal'>
                ESC
              </kbd>
            </div>
            <div className='space-y-1.5'>
              {SHORTCUTS.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  className='w-full text-left bg-white hover:bg-black/5 border-2 border-black p-2.5 rounded-xl text-xs uppercase flex items-center justify-between group transition-colors cursor-pointer'
                >
                  <div className='flex items-center gap-2.5'>
                    <span
                      className={`p-1.5 rounded-lg border-2 border-black flex items-center justify-center ${item.color}`}
                    >
                      {item.icon}
                    </span>
                    <span className='tracking-tight'>{item.name}</span>
                  </div>
                  <span className='opacity-0 group-hover:opacity-100 transition-opacity text-[10px] tracking-wider text-[#d4a373] font-sans font-bold'>
                    JUMP →
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
