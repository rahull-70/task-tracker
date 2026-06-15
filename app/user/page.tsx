'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserIcon, ShieldIcon, TargetIcon, ZapIcon, AwardIcon,
  ArrowLeftIcon, LogOutIcon, PencilIcon, CheckIcon, XIcon,
  StarIcon, FlameIcon, TrophyIcon, BarChart3Icon, CalendarIcon,
  LockIcon, SwordIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createBrowserClient } from '@supabase/ssr';

const XP_LEVELS = [
  { level: 1, name: 'ROOKIE', minXP: 0 },
  { level: 2, name: 'SCOUT', minXP: 200 },
  { level: 3, name: 'SOLDIER', minXP: 500 },
  { level: 4, name: 'CORPORAL', minXP: 1000 },
  { level: 5, name: 'SERGEANT', minXP: 2000 },
  { level: 6, name: 'LIEUTENANT', minXP: 3500 },
  { level: 7, name: 'CAPTAIN', minXP: 5500 },
  { level: 8, name: 'MAJOR', minXP: 8000 },
  { level: 9, name: 'COLONEL', minXP: 11000 },
  { level: 10, name: 'COMMANDANT', minXP: 15000 },
];

const getLevel = (xp: number) => {
  let current = XP_LEVELS[0];
  for (const lvl of XP_LEVELS) { if (xp >= lvl.minXP) current = lvl; }
  const nextLvl = XP_LEVELS.find(l => l.minXP > xp);
  const progress = nextLvl
    ? Math.round(((xp - current.minXP) / (nextLvl.minXP - current.minXP)) * 100)
    : 100;
  return { ...current, nextLvl, progress };
};

export default function UserProfilePage() {
  const { user, logout, isLoading, isLoggedIn, refreshUser } = useAuth();
  const router = useRouter();
  const isPremium = user?.isPremium ?? false;

  const supabaseRef = useRef(createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  ));
  const supabase = supabaseRef.current;

  const [stats, setStats] = useState({
    totalQuests: 0, completedQuests: 0, accuracy: 0,
    streak: 0, maxStreak: 0, xp: 0,
    todayTotal: 0, todayDone: 0,
    highPriorityDone: 0, highPriorityTotal: 0, activeDays: 0,
  });

  const [editingName, setEditingName] = useState(false);
  const [newCodename, setNewCodename] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  const levelInfo = getLevel(stats.xp);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.replace('/login');
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchStats = async () => {
      const { data: quests } = await supabase.from('quests').select('*').eq('user_id', user.id);
      if (!quests) return;

      const todayStr = new Date().toLocaleDateString();
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const completed = quests.filter(q => q.completed).length;
      const xp = completed * (isPremium ? 150 : 100);
      const todayQ = quests.filter(q => new Date(q.created_at).toLocaleDateString() === todayStr);
      const highQ = quests.filter(q => q.priority === 'High');

      const byDate: Record<string, { completed: number }> = {};
      quests.forEach(q => {
        const d = new Date(q.created_at).toLocaleDateString();
        if (!byDate[d]) byDate[d] = { completed: 0 };
        if (q.completed) byDate[d].completed++;
      });

      const sortedDesc = Object.keys(byDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      let streak = 0;
      for (let i = 0; i < sortedDesc.length; i++) {
        const d = new Date(sortedDesc[i]); d.setHours(0, 0, 0, 0);
        if (Math.round((today.getTime() - d.getTime()) / 86400000) === i && byDate[sortedDesc[i]].completed > 0) streak++;
        else break;
      }

      let maxS = 0, tempS = 0;
      for (const date of [...sortedDesc].reverse()) {
        if (byDate[date].completed > 0) { tempS++; if (tempS > maxS) maxS = tempS; } else tempS = 0;
      }

      setStats({
        totalQuests: quests.length, completedQuests: completed,
        accuracy: quests.length > 0 ? Math.round((completed / quests.length) * 100) : 0,
        streak, maxStreak: maxS, xp,
        todayTotal: todayQ.length, todayDone: todayQ.filter(q => q.completed).length,
        highPriorityDone: highQ.filter(q => q.completed).length,
        highPriorityTotal: highQ.length, activeDays: Object.keys(byDate).length,
      });
    };
    fetchStats();
  }, [user, supabase, isPremium]);

  const saveCodename = async () => {
    if (!newCodename.trim()) return;
    setNameSaving(true); setNameError('');
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codename: newCodename.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setNameError(data.error || 'Failed'); return; }
      await refreshUser?.();
      setEditingName(false);
    } catch { setNameError('Network error'); }
    finally { setNameSaving(false); }
  };

  if (isLoading) return (
    <div className='min-h-screen bg-[#fefae0] flex items-center justify-center font-luckiest text-2xl uppercase'>Loading...</div>
  );

  return (
    <div className='min-h-screen bg-[#fefae0] font-luckiest pb-16'>

      {/* Fixed nav buttons */}
      <div className='fixed top-5 left-5 z-50'>
        <Link href='/board'>
          <motion.div whileHover={{ scale: 1.05, x: 4, y: 4, boxShadow: 'none' }} whileTap={{ scale: 0.95 }}
            className='flex items-center gap-2 bg-white border-4 border-black px-4 py-2.5 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-sm uppercase'>
            <ArrowLeftIcon size={16} /> Board
          </motion.div>
        </Link>
      </div>
      <div className='fixed top-5 right-5 z-50'>
        <motion.button whileHover={{ scale: 1.05, x: 2, y: 2, boxShadow: 'none' }} whileTap={{ scale: 0.95 }}
          onClick={async () => { await logout(); router.push('/'); }}
          className='flex items-center gap-2 bg-[#ffadad] hover:bg-red-400 border-4 border-black px-4 py-2.5 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase cursor-pointer text-sm transition-colors'>
          <LogOutIcon size={16} />
          <span className='hidden md:inline'>Log Out</span>
        </motion.button>
      </div>

      <div className='max-w-3xl mx-auto px-4 pt-20 space-y-5'>

        {/* ── PROFILE CARD ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className='bg-white border-4 border-black rounded-3xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'>

          {/* Banner */}
          <div className={`h-32 border-b-4 border-black relative rounded-t-3xl ${isPremium ? 'bg-[#d4a373]' : 'bg-[#faedcd]'}`}>
            <div className='absolute inset-0 overflow-hidden rounded-t-3xl'>
              {isPremium && (
                <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                  className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent' />
              )}
              {/* Decorative pattern */}
              <div className='absolute inset-0 opacity-10'>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className='absolute border-2 border-black rounded-full'
                    style={{ width: 60 + i * 40, height: 60 + i * 40, top: -20, left: -20 + i * 30, opacity: 0.3 }} />
                ))}
              </div>
            </div>

            {/* Avatar */}
            <div className='absolute -bottom-11 left-8 z-20'>
              <div className={`w-22 h-22 w-[88px] h-[88px] border-4 border-black rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative ${isPremium ? 'bg-[#d4a373]' : 'bg-white'}`}>
                <UserIcon size={40} className={isPremium ? 'text-white' : 'opacity-40'} />
                <div className={`absolute -bottom-2 -right-2 border-2 border-black p-1 rounded-lg ${isPremium ? 'bg-[#faedcd]' : 'bg-[#ccd5ae]'}`}>
                  {isPremium ? <StarIcon size={12} className='fill-[#d4a373] text-[#d4a373]' /> : <ShieldIcon size={12} />}
                </div>
              </div>
            </div>

            {isPremium && (
              <div className='absolute top-4 right-4 flex items-center gap-1.5 bg-black/25 border border-white/40 px-3 py-1.5 rounded-full backdrop-blur-sm'>
                <StarIcon size={11} className='fill-white text-white' />
                <span className='text-white text-[10px] uppercase tracking-widest font-luckiest'>Commander</span>
              </div>
            )}
          </div>

          {/* Profile info */}
          <div className='pt-16 px-6 md:px-8 pb-8'>

            {/* Name + XP badge row */}
            <div className='flex flex-col md:flex-row justify-between items-start gap-4 mb-6'>
              <div className='flex-1 min-w-0'>
                {/* Codename */}
                <div className='flex items-center gap-2 flex-wrap mb-1'>
                  <AnimatePresence mode='wait'>
                    {editingName ? (
                      <motion.div key='edit' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className='flex items-center gap-2'>
                        <input
                          value={newCodename}
                          onChange={e => setNewCodename(e.target.value.toUpperCase())}
                          onKeyDown={e => e.key === 'Enter' && saveCodename()}
                          maxLength={20} autoFocus
                          className='bg-[#fefae0] border-4 border-black rounded-xl px-4 py-2 text-xl uppercase font-luckiest outline-none w-44 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all' />
                        <motion.button whileTap={{ scale: 0.9 }} onClick={saveCodename} disabled={nameSaving}
                          className='p-2.5 bg-[#ccd5ae] border-4 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer disabled:opacity-50'>
                          <CheckIcon size={16} />
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setEditingName(false); setNameError(''); }}
                          className='p-2.5 bg-[#ffadad] border-4 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer'>
                          <XIcon size={16} />
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div key='show' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className='flex items-center gap-2'>
                        <h2 className='text-3xl md:text-4xl uppercase tracking-tight'>{user?.codename || 'COMMANDER'}</h2>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => { setNewCodename(user?.codename || ''); setEditingName(true); }}
                          className='p-2 bg-[#faedcd] border-2 border-black rounded-lg cursor-pointer hover:bg-[#d4a373]/20 transition-colors'>
                          <PencilIcon size={13} />
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {nameError && <p className='text-xs text-red-500 uppercase w-full'>{nameError}</p>}
                </div>

                <p className={`text-base uppercase flex items-center gap-2 mb-1 ${isPremium ? 'text-[#d4a373]' : 'opacity-50'}`}>
                  <AwardIcon size={16} />
                  LVL {levelInfo.level} — {levelInfo.name}
                  {isPremium && <span className='text-[10px] bg-[#d4a373] text-white px-2 py-0.5 rounded-full border border-black'>× 1.5 XP</span>}
                </p>
                <p className='text-[11px] opacity-35 uppercase font-sans leading-relaxed'>
                  {user?.email}
                </p>
                <p className='text-[11px] opacity-35 uppercase font-sans'>
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                </p>
                {isPremium && user?.premiumSince && (
                  <p className='text-[11px] text-[#d4a373] uppercase font-sans mt-0.5'>
                    ⭐ Premium since {new Date(user.premiumSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>

              {/* XP badge */}
              <div className={`border-4 border-black rounded-2xl p-4 text-center min-w-[100px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 ${isPremium ? 'bg-[#d4a373]' : 'bg-[#faedcd]'}`}>
                <p className='text-[10px] uppercase opacity-60 mb-1'>Total XP</p>
                <p className='text-3xl font-oi'>{stats.xp.toLocaleString()}</p>
                {isPremium && <p className='text-[10px] opacity-70 mt-0.5'>× 1.5 rate</p>}
              </div>
            </div>

            {/* XP Progress bar */}
            <div className='bg-[#faedcd] border-4 border-black rounded-2xl p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-5'>
              <div className='flex items-center justify-between mb-2 text-xs'>
                <span className='uppercase flex items-center gap-1.5'>
                  <ZapIcon size={13} className={isPremium ? 'text-[#d4a373]' : ''} />
                  LVL {levelInfo.level} · {levelInfo.name}
                </span>
                <span className='opacity-40'>
                  {levelInfo.nextLvl ? `${stats.xp.toLocaleString()} / ${levelInfo.nextLvl.minXP.toLocaleString()} XP` : 'MAX'}
                </span>
              </div>
              <div className='h-5 bg-white border-2 border-black rounded-xl overflow-hidden'>
                <motion.div initial={{ width: 0 }} animate={{ width: `${levelInfo.progress}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                  className={`h-full rounded-xl ${isPremium ? 'bg-gradient-to-r from-[#d4a373] to-[#f07167]' : 'bg-[#d4a373]'}`} />
              </div>
              <div className='flex justify-between mt-1.5 text-[9px] opacity-25 uppercase'>
                {XP_LEVELS.map(l => (
                  <span key={l.level} className={l.level === levelInfo.level ? 'opacity-100 font-bold' : ''}>{l.level}</span>
                ))}
              </div>
            </div>

            {/* ── STAT GRID — varied colors ── */}
            <div className='grid grid-cols-3 gap-3 mb-5'>
              {/* Total Quests — cornsilk */}
              <div className='bg-[#fefae0] border-4 border-black rounded-2xl p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
                <div className='flex items-center gap-1 mb-2 opacity-50'><TargetIcon size={12} /><span className='text-[9px] uppercase'>Quests</span></div>
                <p className='text-2xl md:text-3xl'>{stats.totalQuests}</p>
              </div>
              {/* Completed — tea green */}
              <div className='bg-[#ccd5ae] border-4 border-black rounded-2xl p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
                <div className='flex items-center gap-1 mb-2 opacity-60'><CheckIcon size={12} /><span className='text-[9px] uppercase'>Done</span></div>
                <p className='text-2xl md:text-3xl'>{stats.completedQuests}</p>
              </div>
              {/* Accuracy — papaya */}
              <div className='bg-[#faedcd] border-4 border-black rounded-2xl p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
                <div className='flex items-center gap-1 mb-2 opacity-50'><ZapIcon size={12} /><span className='text-[9px] uppercase'>Rate</span></div>
                <p className='text-2xl md:text-3xl'>{stats.accuracy}%</p>
              </div>
              {/* Streak — warm red */}
              <div className='bg-[#ffadad] border-4 border-black rounded-2xl p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
                <div className='flex items-center gap-1 mb-1 opacity-70'>
                  <Image src='/Fire.gif' alt='fire' width={12} height={12} unoptimized />
                  <span className='text-[9px] uppercase'>Streak</span>
                </div>
                <p className='text-2xl md:text-3xl'>{stats.streak}D</p>
                <p className='text-[9px] opacity-60 mt-0.5'>Best: {stats.maxStreak}D</p>
              </div>
              {/* Active days — light bronze */}
              <div className='bg-[#d4a373] border-4 border-black rounded-2xl p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
                <div className='flex items-center gap-1 mb-2 opacity-70'><CalendarIcon size={12} /><span className='text-[9px] uppercase'>Days</span></div>
                <p className='text-2xl md:text-3xl'>{stats.activeDays}</p>
              </div>
              {/* High priority — beige */}
              <div className='bg-[#e9edc9] border-4 border-black rounded-2xl p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
                <div className='flex items-center gap-1 mb-2 opacity-50'><TrophyIcon size={12} /><span className='text-[9px] uppercase'>High P.</span></div>
                <p className='text-2xl md:text-3xl'>{stats.highPriorityDone}<span className='text-base opacity-40'>/{stats.highPriorityTotal}</span></p>
              </div>
            </div>

            {/* Today's progress */}
            <div className='bg-white border-4 border-black rounded-2xl p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-5'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-sm uppercase flex items-center gap-2'><BarChart3Icon size={15} /> Today's Progress</h3>
                <span className='text-sm opacity-50'>{stats.todayDone}/{stats.todayTotal}</span>
              </div>
              <div className='h-4 bg-[#fefae0] border-2 border-black rounded-xl overflow-hidden'>
                <motion.div initial={{ width: 0 }}
                  animate={{ width: `${stats.todayTotal > 0 ? (stats.todayDone / stats.todayTotal) * 100 : 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className='h-full bg-[#d4a373] rounded-xl' />
              </div>
            </div>

            {/* Credentials */}
            <div className='border-t-4 border-black pt-5 mb-5'>
              <h3 className='text-sm uppercase opacity-40 mb-3'>Credentials</h3>
              <div className='bg-[#fefae0] border-4 border-black p-4 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-4'>
                <span className='text-xs opacity-40 uppercase'>Email</span>
                <span className='text-sm font-sans opacity-70 truncate'>{user?.email || '—'}</span>
              </div>
            </div>

            {/* Premium status */}
            {isPremium ? (
              <div className='bg-[#d4a373] border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between'>
                <div>
                  <p className='text-sm uppercase flex items-center gap-2 mb-0.5'>
                    <StarIcon size={15} className='fill-current' /> Commander Status Active
                  </p>
                  <p className='text-[10px] opacity-70 font-sans'>1.5× XP · Full Analytics · PDF Export · Streak History</p>
                </div>
                <Link href='/premium'>
                  <motion.div whileHover={{ scale: 1.04 }}
                    className='bg-white border-2 border-black px-3 py-2 rounded-xl text-xs uppercase cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'>
                    Manage
                  </motion.div>
                </Link>
              </div>
            ) : (
              <Link href='/premium'>
                <motion.div whileHover={{ scale: 1.02, x: 3, y: 3, boxShadow: 'none' }} whileTap={{ scale: 0.98 }}
                  className='bg-[#faedcd] border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between cursor-pointer'>
                  <div>
                    <p className='text-sm uppercase flex items-center gap-2 mb-0.5'>
                      <LockIcon size={13} /> Unlock Premium
                    </p>
                    <p className='text-[10px] opacity-50 font-sans'>1.5× XP · Full Analytics · PDF Export · Streak History</p>
                  </div>
                  <div className='bg-[#d4a373] border-2 border-black px-3 py-2 rounded-xl text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'>
                    $4.99/mo
                  </div>
                </motion.div>
              </Link>
            )}
          </div>
        </motion.div>

        {/* ── QUICK NAV ── */}
        <div className='grid grid-cols-2 gap-3'>
          {[
            { label: 'Stat Center', href: '/dashboard', bg: 'bg-[#faedcd]', border: 'border-black', icon: <BarChart3Icon size={18} /> },
            { label: 'Quest Board', href: '/board', bg: 'bg-[#ccd5ae]', border: 'border-black', icon: <SwordIcon size={18} /> },
            { label: 'Focus Arc', href: '/focus', bg: 'bg-[#ffd6a5]', border: 'border-black', icon: <ZapIcon size={18} /> },
            { label: 'Zen Garden', href: null, bg: 'bg-[#d4a373]', border: 'border-black', icon: <FlameIcon size={18} /> },
          ].map((nav, i) => (
            nav.href ? (
              <Link key={i} href={nav.href}>
                <motion.div whileHover={{ scale: 1.03, x: 3, y: 3, boxShadow: 'none' }} whileTap={{ scale: 0.97 }}
                  className={`${nav.bg} border-4 ${nav.border} rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 cursor-pointer`}>
                  {nav.icon}
                  <span className='text-sm uppercase'>{nav.label}</span>
                </motion.div>
              </Link>
            ) : (
              <div key={i}
                className={`${nav.bg} border-4 ${nav.border} rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 justify-between cursor-default relative opacity-90`}>
                <div className='flex items-center gap-3'>
                  {nav.icon}
                  <span className='text-sm uppercase'>{nav.label}</span>
                </div>
                <span className='text-[9px] uppercase bg-white border-2 border-black px-2 py-1 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'>
                  Soon
                </span>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}