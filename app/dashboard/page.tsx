'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  TrophyIcon, 
  TargetIcon, 
  ZapIcon, 
  FlameIcon 
} from 'lucide-react';

interface Task {
  task: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  completed: boolean;
}

interface Stats {
  total: number;
  completed: number;
  pending: number;
  rate: number;
  streak: number;
}

const Dashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]); 
  const [stats, setStats] = useState<Stats>({
    total: 0,
    completed: 0,
    pending: 0,
    rate: 0,
    streak: 0
  });

  useEffect(() => {
    setMounted(true);
    const rawData = localStorage.getItem('task-data');
    // GET DATA FROM LOCALSTORAGE
    const savedHistory = JSON.parse(localStorage.getItem('mission-history') || '[]');
    const savedTasks = rawData ? JSON.parse(rawData) : null;
    
    // SAVE TO STATE SO JSX CAN SEE IT
    setHistoryData(savedHistory);

    let totalMissions = savedHistory.reduce((acc: number, day: any) => acc + (day.total || 0), 0);
    let totalCompleted = savedHistory.reduce((acc: number, day: any) => acc + (day.completed || 0), 0);

    if (savedTasks && savedTasks.tasks) {
      totalMissions += savedTasks.tasks.length;
      totalCompleted += savedTasks.tasks.filter((t: Task) => t.completed).length;
    }

    const lastActive = localStorage.getItem('last-active-date');
    let currentStreak = parseInt(localStorage.getItem('mission-streak') || '0');
    
    if (lastActive) {
      const today = new Date().toLocaleDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastActive !== today && lastActive !== yesterday.toLocaleDateString()) {
        currentStreak = 0;
        localStorage.setItem('mission-streak', '0');
      }
    }

    setStats({
      total: totalMissions,
      completed: totalCompleted,
      pending: totalMissions - totalCompleted,
      rate: totalMissions > 0 ? Math.round((totalCompleted / totalMissions) * 100) : 0,
      streak: currentStreak
    });
  }, []);

  
  if (!mounted) return <div className="min-h-screen bg-[#f1f1f1]" />;

  return (
    <div className='p-6 md:p-10 min-h-screen bg-[#f1f1f1] text-foreground font-luckiest'>
      {/* Header Navigation */}
      <div className='max-w-6xl mx-auto flex justify-between items-center mb-10'>
        <Link href="/">
          <div className='flex items-center gap-2 bg-white border-4 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer'>
            <ArrowLeftIcon size={24} />
            <span>BACK TO MISSIONS</span>
          </div>
        </Link>
        <h1 className='text-4xl md:text-6xl font-oi tracking-tighter md:px-0 px-3'>STAT CENTER</h1>
      </div>

      <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8'>
        
        {/* Main Score Card */}
        <div className='md:col-span-2 bg-primary p-8 rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-white relative overflow-hidden'>
          <ZapIcon className='absolute right-[-20px] top-[-20px] opacity-20 rotate-12' size={200} />
          <h2 className='text-3xl mb-4 uppercase'>Mission Success Rate</h2>
          <div className='text-8xl md:text-9xl mb-4'>{stats.rate}%</div>
          <p className='text-xl opacity-90'>
            {stats.rate > 80 ? "YOU ARE CRUSHING YOUR OBJECTIVES!" : "KEEP PUSHING, AGENT!"}
          </p>
        </div>

        {/* Small Stat Blocks */}
        <div className='flex flex-col gap-6'>
          <div className='bg-[#ccd5ae] p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between'>
            <div>
              <p className='text-sm uppercase opacity-70'>Completed</p>
              <p className='text-4xl'>{stats.completed}</p>
            </div>
            <TrophyIcon size={40} />
          </div>

          <div className='bg-[#faedcd] p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between'>
            <div>
              <p className='text-sm uppercase opacity-70'>Total Missions</p>
              <p className='text-4xl'>{stats.total}</p>
            </div>
            <TargetIcon size={40} />
          </div>

          <div className='bg-[#d8e2dc] p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between'>
            <div>
              <p className='text-sm uppercase opacity-70'>Current Streak</p>
              <p className='text-4xl'>{stats.streak} Days</p>
            </div>
            <FlameIcon size={40} className={stats.streak > 0 ? "text-orange-500" : "text-gray-400"} />
          </div>
        </div>

        {/* Visual Progress Chart */}
        <div className='md:col-span-3 bg-white p-8 rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'>
          <h2 className='text-3xl mb-8 uppercase text-center'>Weekly Momentum</h2>
          <div className='flex items-end justify-between h-64 gap-2 md:gap-4 border-b-4 border-black pb-2'>
            {/* Logic: Map last 7 entries from mission-history */}
            {[...Array(7)].map((_, i) => {
               const dayData = historyData[historyData.length - (7 - i)];
               const height = dayData ? Math.min((dayData.completed / dayData.total) * 100, 100) : 10;
               return (
                <div key={i} className='flex-1 flex flex-col items-center gap-2'>
                  <div 
                    style={{ height: `${height}%` }}
                    className={`w-full border-4 border-black rounded-t-xl shadow-[4px_0px_0px_0px_rgba(0,0,0,1)] transition-all hover:brightness-90 ${height > 70 ? 'bg-primary' : 'bg-secondary'}`}
                  ></div>
                  <span className='text-[10px] md:text-sm uppercase'>{dayData ? dayData.date.split('/')[0] + '/' + dayData.date.split('/')[1] : `Day ${i+1}`}</span>
                </div>
               )
            })}
          </div>
        </div>

      </div>

      <div className='mt-12 text-center opacity-50 uppercase tracking-widest text-sm'>
        Data is synced to your local headquarters.
      </div>
    </div>
  );
};

export default Dashboard;