'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  TrophyIcon,
  TargetIcon,
  ZapIcon,
  FlameIcon,
  CalendarIcon,
  PieChartIcon,
  DownloadIcon,
  TrendingUpIcon,
  BarChart3Icon,
  LogOutIcon,        // ← new
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // ← new

// ── Protected Route: redirects to /login if not authenticated ────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, router]);

  // Render nothing while redirecting so the page doesn't flash
  if (!isLoggedIn) return null;

  return <>{children}</>;
};

// ── Main Dashboard component (unchanged logic, auth additions marked) ─────────
const Dashboard = () => {
  const { user, logout } = useAuth(); // ← new
  const router = useRouter();          // ← new

  const [mounted, setMounted] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [priorityData, setPriorityData] = useState({
    High: 0,
    Medium: 0,
    Low: 0,
    None: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    rate: 0,
    streak: 0,
    xp: 0,
  });

  useEffect(() => {
    setMounted(true);
    const rawData = localStorage.getItem('task-data');
    const parsed = rawData ? JSON.parse(rawData) : {};
    const currentTasks = Array.isArray(parsed) ? parsed : parsed.tasks || [];

    // 1. Functional Priority Stats
    const priorities = currentTasks.reduce(
      (acc: any, task: any) => {
        const p = task.priority || 'None';
        if (acc.hasOwnProperty(p)) acc[p]++;
        return acc;
      },
      { High: 0, Medium: 0, Low: 0, None: 0 },
    );
    setPriorityData(priorities);

    const totalToday = currentTasks.length;
    const completedToday = currentTasks.filter(
      (t: any) => t.completed || t.status === 'Done',
    ).length;

    const todayStats = {
      date: new Date().toLocaleDateString(),
      total: totalToday,
      completed: completedToday,
      percent: totalToday > 0 ? (completedToday / totalToday) * 100 : 0,
      isToday: true,
    };

    // 2. Load and Format History
    const savedHistory = JSON.parse(
      localStorage.getItem('mission-history') || '[]',
    );
    const formattedHistory = savedHistory.map((day: any) => ({
      ...day,
      percent: day.total > 0 ? (day.completed / day.total) * 100 : 0,
    }));

    const fullHistory = [...formattedHistory, todayStats];
    setHistoryData(fullHistory);

    // 3. Overall Stats
    const lifetimeCompleted =
      formattedHistory.reduce((acc: number, d: any) => acc + d.completed, 0) +
      completedToday;
    setStats({
      total: totalToday,
      completed: completedToday,
      rate:
        totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0,
      streak: parseInt(localStorage.getItem('mission-streak') || '0'),
      xp: lifetimeCompleted * 100,
    });
  }, []);

  const getBarDecoration = (
    dayData: any,
    barHeight: number,
    type: 'weekly' | 'monthly',
  ) => {
    const isToday = dayData?.isToday;
    let baseColor = dayData?.percent > 70 ? '#ccd5ae' : '#C8C3C1';
    if (isToday) baseColor = '#FFC88A';

    return {
      height: `${Math.max(barHeight, dayData ? (type === 'weekly' ? 8 : 12) : 0)}%`,
      backgroundColor: baseColor,
      backgroundImage: dayData
        ? `linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)`
        : 'none',
      backgroundSize: '10px 10px',
    };
  };

  // ── AUTH: log out and return to home ────────────────────────────────────────
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const containerVars = {
    animate: { transition: { staggerChildren: 0.05 } },
  };

  const itemVars = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  if (!mounted) return <div className='min-h-screen bg-accent' />;

  return (
    <motion.div
      initial='initial'
      animate='animate'
      variants={containerVars}
      className='p-6 md:p-10 min-h-screen bg-accent text-foreground font-luckiest'
    >
      {/* HEADER */}
      <div className='max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-6'>
        <Link href='/'>
          <motion.div
            whileHover={{ scale: 1.05, x: 5, y: 5 }}
            whileTap={{ scale: 0.95 }}
            className='flex items-center gap-2 bg-white border-4 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer'
          >
            <ArrowLeftIcon size={24} />
            <span>BACK TO Quest</span>
          </motion.div>
        </Link>

        <motion.h1
          variants={itemVars}
          className='text-3xl md:text-6xl font-oi tracking-wide text-center'
        >
          STAT CENTER
        </motion.h1>

        {/* RIGHT SIDE: XP rank + logout ── auth addition */}
        <div className='flex items-center gap-3'>
          <motion.div
            variants={itemVars}
            className='bg-black text-primary p-3 rounded-xl border-b-4 border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
          >
            {user?.codename ?? 'COMMANDER'} |{' '}
            {stats.xp > 5000
              ? 'COMMANDANT'
              : stats.xp > 1000
                ? 'VETERAN'
                : 'ROOKIE'}{' '}
            | {stats.xp} XP
          </motion.div>

          {/* LOGOUT BUTTON ── auth addition */}
          <motion.button
            variants={itemVars}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className='flex items-center gap-2 bg-red-400 border-4 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white uppercase cursor-pointer'
          >
            <LogOutIcon size={20} />
            <span className='hidden md:inline'>Log Out</span>
          </motion.button>
        </div>
      </div>

      <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8'>
        {/* SUCCESS RATE CARD */}
        <motion.div
          variants={itemVars}
          whileHover={{ scale: 1.01 }}
          className='md:col-span-2 bg-primary p-8 rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-white relative overflow-hidden'
        >
          <ZapIcon
            className='absolute right-[-20px] top-[-20px] opacity-20 rotate-12'
            size={200}
          />
          <h2 className='text-3xl mb-4 uppercase'>Quest Success Rate</h2>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className='text-8xl md:text-9xl mb-4'
          >
            {stats.rate}%
          </motion.div>
          <p className='text-xl opacity-90 uppercase flex items-center gap-2'>
            <TrendingUpIcon /> Status:{' '}
            {stats.rate > 80
              ? 'Elite'
              : stats.rate > 50
                ? 'Optimal'
                : 'Standard'}
          </p>
        </motion.div>

        {/* COMPLETED / TOTAL / STREAK */}
        <div className='flex flex-col gap-6'>
          {[
            {
              label: 'COMPLETED',
              val: stats.completed,
              color: '#ccd5ae',
              icon: <TrophyIcon size={40} />,
            },
            {
              label: 'TOTAL',
              val: stats.total,
              color: '#faedcd',
              icon: <TargetIcon size={40} />,
            },
            {
              label: 'STREAK',
              val: `${stats.streak} DAYS`,
              color: '#d8e2dc',
              icon: (
                <FlameIcon
                  size={40}
                  className={
                    stats.streak > 0 ? 'text-orange-500' : 'text-gray-400'
                  }
                />
              ),
            },
          ].map((item) => (
            <motion.div
              key={item.label}
              variants={itemVars}
              whileHover={{ scale: 1.05, x: -5 }}
              style={{ backgroundColor: item.color }}
              className='p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between'
            >
              <div>
                <p className='text-sm opacity-70'>{item.label}</p>
                <p className='text-4xl'>{item.val}</p>
              </div>
              {item.icon}
            </motion.div>
          ))}
        </div>

        {/* PRIORITY LOADOUT */}
        <motion.div
          variants={itemVars}
          className='md:col-span-1 bg-white p-8 rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'
        >
          <h2 className='text-2xl mb-6 uppercase flex items-center gap-2'>
            <PieChartIcon /> Priority Loadout
          </h2>
          <div className='space-y-4'>
            {Object.entries(priorityData).map(([key, val]) => (
              <div key={key} className='flex flex-col gap-1'>
                <div className='flex justify-between text-sm uppercase'>
                  <span>{key}</span>
                  <span>{val}</span>
                </div>
                <div className='h-6 border-2 border-black rounded-md bg-gray-100 overflow-hidden'>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(val / (stats.total || 1)) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full ${key === 'High' ? 'bg-[#ffadad]' : key === 'Medium' ? 'bg-[#ffd6a5]' : 'bg-[#caffbf]'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* WEEKLY PERFORMANCE */}
        <motion.div
          variants={itemVars}
          className='md:col-span-2 bg-white p-8 rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'
        >
          <h2 className='text-2xl mb-8 uppercase flex items-center gap-2'>
            <BarChart3Icon /> Weekly Performance
          </h2>
          <div className='flex items-end justify-between h-40 gap-2 border-b-4 border-black pb-2'>
            {[...Array(7)].map((_, i) => {
              const dayData = historyData[historyData.length - (7 - i)];
              const barHeight = dayData ? dayData.percent : 0;
              return (
                <div
                  key={i}
                  className='flex-1 h-full flex flex-col justify-end items-center gap-2'
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: `${Math.max(barHeight, dayData ? 8 : 0)}%`,
                    }}
                    transition={{ delay: i * 0.05, type: 'spring' }}
                    style={getBarDecoration(dayData, barHeight, 'weekly')}
                    className={`w-full border-2 md:border-4 border-black rounded-t-lg ${!dayData ? 'opacity-10' : ''}`}
                  />
                  <span className='text-[8px] md:text-xs uppercase'>
                    {dayData
                      ? dayData.date.split('/')[0] +
                        '/' +
                        dayData.date.split('/')[1]
                      : '--'}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* MONTHLY MOMENTUM */}
        <motion.div
          variants={itemVars}
          className='md:col-span-3 bg-white p-8 rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'
        >
          <h2 className='text-2xl mb-6 uppercase flex items-center gap-2'>
            <CalendarIcon /> Monthly Momentum
          </h2>
          <div className='flex items-end h-24 gap-1 border-b-2 border-black pb-1'>
            {[...Array(30)].map((_, i) => {
              const dayData = historyData[historyData.length - (30 - i)];
              const barHeight = dayData ? dayData.percent : 0;
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{
                    height: `${Math.max(barHeight, dayData ? 15 : 5)}%`,
                  }}
                  transition={{ delay: i * 0.02 }}
                  style={getBarDecoration(dayData, barHeight, 'monthly')}
                  className={`flex-1 border border-black rounded-t-sm ${!dayData ? 'opacity-5' : ''}`}
                />
              );
            })}
          </div>
        </motion.div>

        {/* YEARLY COMBAT RECORD */}
        <motion.div
          variants={itemVars}
          className='md:col-span-3 bg-white p-8 rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'
        >
          <h2 className='text-2xl mb-6 uppercase'>Yearly Combat Record</h2>
          <div className='flex flex-wrap gap-1 justify-center md:justify-start overflow-x-auto pb-2'>
            {[...Array(52)].map((_, i) => (
              <div key={i} className='flex flex-col gap-1'>
                {[...Array(7)].map((_, j) => {
                  const dayIndex = historyData.length - ((52 - i) * 7 - j);
                  const day = historyData[dayIndex];
                  const hasActivity = day && day.total > 0;
                  const isHighSuccess = day && day.percent > 70;

                  return (
                    <motion.div
                      key={j}
                      whileHover={{ scale: 1.5, zIndex: 10 }}
                      className={`w-3 h-3 md:w-4 md:h-4 border border-black/20 rounded-sm 
                        ${isHighSuccess ? 'bg-primary' : hasActivity ? 'bg-primary/40' : 'bg-gray-100'}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <p className='mt-4 text-xs opacity-50 uppercase italic'>
            Yellow: High Success | Dim Yellow: Activity Recorded | Gray: No Data
          </p>
        </motion.div>

        {/* EXPORT SECTION */}
        <motion.div
          variants={itemVars}
          className='md:col-span-3 bg-secondary p-8 rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-6'
        >
          <div className='text-white text-center md:text-left'>
            <h2 className='text-3xl uppercase mb-2'>Mission Debrief</h2>
            <p className='opacity-80 uppercase'>
              Export tactical data for offline archives.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: -2 }}
            whileTap={{ scale: 0.9 }}
            className='bg-white border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_#000000] flex items-center gap-3 text-xl uppercase cursor-pointer transition-colors hover:bg-primary'
          >
            <DownloadIcon size={24} /> Download PDF
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ── Wrap Dashboard in ProtectedRoute so unauthenticated users get redirected ──
const DashboardPage = () => (
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
);

export default DashboardPage;