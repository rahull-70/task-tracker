'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Target, Zap, Award, ArrowLeftIcon, LogOutIcon, FlameIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createBrowserClient } from '@supabase/ssr';

const UserProfilePage = () => {
  const { user, logout, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const [stats, setStats] = useState({ missions: 0, accuracy: '0%', streak: 0, xp: 0 });
  const [joined, setJoined] = useState('');
  const [rank, setRank] = useState('ROOKIE');

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchStats = async () => {
      const { data: quests } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', user.id);

      if (!quests) return;

      const totalMissions = quests.length;
      const completed = quests.filter(q => q.completed).length;
      const accuracy = totalMissions > 0 ? Math.round((completed / totalMissions) * 100) : 0;
      const xp = completed * 100;

      // Calculate streak
      const byDate: Record<string, { completed: number }> = {};
      quests.forEach((q: any) => {
        const d = new Date(q.created_at).toLocaleDateString();
        if (!byDate[d]) byDate[d] = { completed: 0 };
        if (q.completed) byDate[d].completed++;
      });

      const sortedDates = Object.keys(byDate).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      );
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      for (let i = 0; i < sortedDates.length; i++) {
        const d = new Date(sortedDates[i]);
        d.setHours(0, 0, 0, 0);
        const diffDays = Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === i && byDate[sortedDates[i]].completed > 0) streak++;
        else break;
      }

      setStats({ missions: totalMissions, accuracy: `${accuracy}%`, streak, xp });
      setRank(xp > 5000 ? 'COMMANDANT' : xp > 1000 ? 'VETERAN' : 'ROOKIE');
    };

    // Set joined date from user id (cuid has timestamp encoded, use current as fallback)
    setJoined(new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }));
    fetchStats();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-soft flex items-center justify-center font-luckiest text-2xl uppercase'>
        Loading...
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-soft flex items-center justify-center p-6 font-luckiest text-foreground'>

      {/* BACK BUTTON */}
      <div className='fixed top-6 left-6 md:top-10 md:left-10 z-50'>
        <Link href='/'>
          <motion.div
            whileHover={{ scale: 1.05, x: 5, y: 5, boxShadow: 'none' }}
            whileTap={{ scale: 0.95 }}
            className='flex items-center gap-2 bg-white border-4 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer'
          >
            <ArrowLeftIcon size={20} />
            <span className='uppercase'>Back</span>
          </motion.div>
        </Link>
      </div>

      {/* LOGOUT BUTTON */}
      <div className='fixed top-6 right-6 md:top-10 md:right-10 z-50'>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className='flex items-center gap-2 bg-red-400 border-4 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white uppercase cursor-pointer'
        >
          <LogOutIcon size={20} />
          <span className='hidden md:inline'>Log Out</span>
        </motion.button>
      </div>

      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className='w-full max-w-2xl bg-white border-4 border-black rounded-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden mt-16 md:mt-0'
      >
        {/* HEADER BANNER */}
        <div className='bg-primary h-24 border-b-4 border-black relative'>
          <div className='absolute -bottom-12 left-8'>
            <div className='relative'>
              <div className='w-24 h-24 bg-secondary border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center'>
                <User size={48} className='text-white' />
              </div>
              <div className='absolute -bottom-2 -right-2 bg-[#caffbf] border-2 border-black p-1 rounded-lg'>
                <Shield size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* PROFILE CONTENT */}
        <div className='pt-16 p-8'>
          <div className='flex flex-col md:flex-row justify-between items-start gap-4'>
            <div>
              <h2 className='text-4xl font-oi uppercase tracking-tighter'>
                {user?.codename || 'COMMANDER'}
              </h2>
              <p className='text-light-bronze text-xl uppercase opacity-80 flex items-center gap-2'>
                <Award size={20} className='text-primary' /> {rank}
              </p>
              <p className='text-sm mt-2 font-sans font-bold opacity-50 uppercase'>
                Active Since: {joined}
              </p>
            </div>

            {/* XP BADGE */}
            <div className='bg-black text-primary border-4 border-primary p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center'>
              <p className='text-xs opacity-60 uppercase'>Total XP</p>
              <p className='text-3xl'>{stats.xp}</p>
            </div>
          </div>

          {/* STAT GRID */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-10'>
            <div className='bg-[#ffd6a5] border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
              <div className='flex items-center gap-2 mb-1 opacity-70'>
                <Target size={16} /> <span className='text-xs uppercase'>Total Quests</span>
              </div>
              <p className='text-3xl'>{stats.missions}</p>
            </div>

            <div className='bg-[#caffbf] border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
              <div className='flex items-center gap-2 mb-1 opacity-70'>
                <Zap size={16} /> <span className='text-xs uppercase'>Success Rate</span>
              </div>
              <p className='text-3xl'>{stats.accuracy}</p>
            </div>

            <div className='bg-[#9bf6ff] border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
              <div className='flex items-center gap-2 mb-1 opacity-70'>
                <FlameIcon size={16} className={stats.streak > 0 ? 'text-orange-500' : ''} />
                <span className='text-xs uppercase'>Streak</span>
              </div>
              <p className='text-3xl'>{stats.streak}D</p>
            </div>
          </div>

          {/* CREDENTIALS */}
          <div className='mt-10 border-t-4 border-black pt-6'>
            <h3 className='text-xl uppercase mb-4'>Credentials</h3>
            <div className='bg-soft border-4 border-black p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4'>
              <span className='opacity-60 uppercase'>Intel (Email)</span>
              <span className='font-sans font-bold'>{user?.email || '—'}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfilePage;