'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion'; // Added Framer Motion
import {
  ArrowLeftIcon,
  TrophyIcon,
  TargetIcon,
  ZapIcon,
  FlameIcon,
  CalendarIcon,
} from 'lucide-react';

const Dashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    rate: 0,
    streak: 0,
  });

  useEffect(() => {
    setMounted(true);

    const rawData = localStorage.getItem('task-data');
    const parsed = rawData ? JSON.parse(rawData) : {};
    const currentTasks = Array.isArray(parsed) ? parsed : parsed.tasks || [];

    const totalToday = currentTasks.length;
    const completedToday = currentTasks.filter(
      (t: any) => t.completed === true || t.status === 'Done',
    ).length;

    const todayStats = {
      date: new Date().toLocaleDateString(),
      total: totalToday,
      completed: completedToday,
      percent: totalToday > 0 ? (completedToday / totalToday) * 100 : 0,
      isToday: true,
    };

    const savedHistory = JSON.parse(
      localStorage.getItem('mission-history') || '[]',
    );
    const formattedHistory = savedHistory.map((day: any) => ({
      ...day,
      percent: day.total > 0 ? (day.completed / day.total) * 100 : 0,
    }));

    setHistoryData([...formattedHistory, todayStats]);

    const totalMissions =
      formattedHistory.reduce((acc: number, d: any) => acc + d.total, 0) +
      totalToday;
    const totalCompleted =
      formattedHistory.reduce((acc: number, d: any) => acc + d.completed, 0) +
      completedToday;

    const currentStreak = parseInt(
      localStorage.getItem('mission-streak') || '0',
    );

    setStats({
      total: totalMissions,
      completed: totalCompleted,
      rate:
        totalMissions > 0
          ? Math.round((totalCompleted / totalMissions) * 100)
          : 0,
      streak: currentStreak,
    });
  }, []);

  const getBarDecoration = (
    dayData: any,
    barHeight: number,
    type: 'weekly' | 'monthly',
  ) => {
    const isToday = dayData?.isToday;
    let baseColor = '#C8C3C1';
    if (isToday) baseColor = '#FFC88A';
    if (type === 'monthly' && !isToday) baseColor = '#C8C3C1';

    return {
      height: `${Math.max(barHeight, type === 'weekly' ? 5 : 8)}%`,
      backgroundColor: baseColor,
      backgroundImage: dayData
        ? `linear-gradient(
        45deg, 
        rgba(255, 255, 255, 0.3) 25%, 
        transparent 25%, 
        transparent 50%, 
        rgba(255, 255, 255, 0.3) 50%, 
        rgba(255, 255, 255, 0.3) 75%, 
        transparent 75%, 
        transparent
      )`
        : 'none',
      backgroundSize: '12px 12px',
    };
  };

  if (!mounted) return <div className='min-h-screen bg-accent' />;

  return (
    <div className='p-6 md:p-10 min-h-screen bg-accent text-foreground font-luckiest'>
      <div className='max-w-6xl mx-auto flex justify-between items-center mb-10'>
        <Link href='/'>
          <motion.div 
            whileHover={{ scale: 1.05, x: 5, y: 5, boxShadow: 'none' }}
            whileTap={{ scale: 0.95 }}
            className='flex items-center gap-2 bg-white border-4 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer'
          >
            <ArrowLeftIcon size={24} />
            <span>BACK TO MISSIONS</span>
          </motion.div>
        </Link>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-3xl md:text-6xl font-oi tracking-wide'
        >
          STAT CENTER
        </motion.h1>
      </div>

      <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8'>
        {/* STAT CARDS */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className='md:col-span-2 bg-primary p-8 rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-white relative overflow-hidden'
        >
          <ZapIcon
            className='absolute right-[-20px] top-[-20px] opacity-20 rotate-12'
            size={200}
          />
          <h2 className='text-3xl mb-4 uppercase'>Mission Success Rate</h2>
          <motion.div 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className='text-8xl md:text-9xl mb-4'
          >
            {stats.rate}%
          </motion.div>
          <p className='text-xl opacity-90 uppercase'>
            Operational Status: {stats.rate > 50 ? 'Optimal' : 'Standard'}
          </p>
        </motion.div>

        <div className='flex flex-col gap-6'>
          {[
            { label: 'COMPLETED', val: stats.completed, color: '#ccd5ae', icon: <TrophyIcon size={40} /> },
            { label: 'TOTAL', val: stats.total, color: '#faedcd', icon: <TargetIcon size={40} /> },
            { label: 'STREAK', val: `${stats.streak} DAYS`, color: '#d8e2dc', icon: <FlameIcon size={40} className={stats.streak > 0 ? 'text-orange-500' : 'text-gray-400'} /> },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
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

        {/* WEEKLY CHART */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='md:col-span-3 bg-white p-8 rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'
        >
          <h2 className='text-3xl mb-8 uppercase text-center'>Weekly Performance</h2>
          <div className='flex items-end justify-between h-48 gap-2 md:gap-4 border-b-4 border-black pb-2'>
            {[...Array(7)].map((_, i) => {
              const dayData = historyData[historyData.length - (7 - i)];
              const barHeight = dayData ? dayData.percent : 0;
              return (
                <div key={i} className='flex-1 h-full flex flex-col justify-end items-center gap-2'>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(barHeight, dayData ? 5 : 0)}%` }}
                    transition={{ type: 'spring', damping: 15, delay: i * 0.05 }}
                    style={getBarDecoration(dayData, barHeight, 'weekly')}
                    className={`w-full border-4 border-black rounded-t-xl transition-colors duration-500 ${!dayData ? 'opacity-10' : 'opacity-100'}`}
                  />
                  <span className={`text-[10px] md:text-sm uppercase ${dayData?.isToday ? 'font-bold' : ''}`}>
                    {dayData ? (dayData.isToday ? 'Today' : dayData.date.split('/')[0] + '/' + dayData.date.split('/')[1]) : '--'}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* MONTHLY CHART */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='md:col-span-3 bg-white p-8 rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'
        >
          <h2 className='text-3xl mb-8 uppercase text-center flex items-center justify-center gap-3'>
            <CalendarIcon /> Monthly Momentum
          </h2>
          <div className='overflow-x-auto pb-4'>
            <div className='flex items-end h-32 gap-1 min-w-[800px] border-b-4 border-black'>
              {[...Array(30)].map((_, i) => {
                const dayData = historyData[historyData.length - (30 - i)];
                const barHeight = dayData ? dayData.percent : 0;
                return (
                  <div key={i} className='flex-1 h-full flex flex-col justify-end items-center'>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(barHeight, dayData ? 8 : 0)}%` }}
                      transition={{ duration: 0.8, delay: i * 0.02 }}
                      style={getBarDecoration(dayData, barHeight, 'monthly')}
                      className={`w-full border-2 border-black rounded-t-sm transition-colors duration-700 ${!dayData ? 'opacity-10' : 'opacity-100'}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;