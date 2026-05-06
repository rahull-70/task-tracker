'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  TrophyIcon, 
  TargetIcon, 
  ZapIcon, 
  FlameIcon,
  CalendarIcon
} from 'lucide-react';

interface Task {
  task: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  completed: boolean;
}

const Dashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]); 
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    rate: 0,
    streak: 0
  });

  useEffect(() => {
    setMounted(true);
    
    // 1. Fetch current missions correctly from the object or array
    const rawData = localStorage.getItem('task-data');
    const parsed = rawData ? JSON.parse(rawData) : {};
    const currentTasks = Array.isArray(parsed) ? parsed : (parsed.tasks || []);

    const totalToday = currentTasks.length;
    const completedToday = currentTasks.filter((t: any) => 
      t.completed === true || t.status === 'Done'
    ).length;

    const todayStats = {
      date: new Date().toLocaleDateString(),
      total: totalToday,
      completed: completedToday,
      percent: totalToday > 0 ? (completedToday / totalToday) * 100 : 0,
      isToday: true
    };

    // 2. Process historical logs
    const savedHistory = JSON.parse(localStorage.getItem('mission-history') || '[]');
    const formattedHistory = savedHistory.map((day: any) => ({
      ...day,
      percent: day.total > 0 ? (day.completed / day.total) * 100 : 0
    }));

    // Merge history with today's live stats
    setHistoryData([...formattedHistory, todayStats]);

    // 3. Update Stat Calculations
    const totalMissions = formattedHistory.reduce((acc: number, d: any) => acc + d.total, 0) + totalToday;
    const totalCompleted = formattedHistory.reduce((acc: number, d: any) => acc + d.completed, 0) + completedToday;

    const lastActive = localStorage.getItem('last-active-date');
    let currentStreak = parseInt(localStorage.getItem('mission-streak') || '0');
    const todayStr = new Date().toLocaleDateString();

    // Ensure streak counts today if productivity is detected
    if (completedToday > 0 && lastActive !== todayStr) {
      currentStreak += 1; 
    }

    setStats({
      total: totalMissions,
      completed: totalCompleted,
      rate: totalMissions > 0 ? Math.round((totalCompleted / totalMissions) * 100) : 0,
      streak: currentStreak
    });
  }, []);

  if (!mounted) return <div className="min-h-screen" />;

  return (
    <div className='p-6 md:p-10 min-h-screen bg-accent text-foreground font-luckiest'>
      <div className='max-w-6xl mx-auto flex justify-between items-center mb-10'>
        <Link href="/">
          <div className='flex items-center gap-2 bg-white border-4 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer'>
            <ArrowLeftIcon size={24} />
            <span>BACK TO MISSIONS</span>
          </div>
        </Link>
        <h1 className='text-4xl md:text-6xl font-oi tracking-tighter'>STAT CENTER</h1>
      </div>

      <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8'>
        
        <div className='md:col-span-2 bg-primary p-8 rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-white relative overflow-hidden'>
          <ZapIcon className='absolute right-[-20px] top-[-20px] opacity-20 rotate-12' size={200} />
          <h2 className='text-3xl mb-4 uppercase'>Mission Success Rate</h2>
          <div className='text-8xl md:text-9xl mb-4'>{stats.rate}%</div>
          <p className='text-xl opacity-90 uppercase'>Operational Status: {stats.rate > 50 ? 'Optimal' : 'Standard'}</p>
        </div>

        <div className='flex flex-col gap-6'>
          <div className='bg-[#ccd5ae] p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between'>
            <div><p className='text-sm opacity-70'>COMPLETED</p><p className='text-4xl'>{stats.completed}</p></div>
            <TrophyIcon size={40} />
          </div>
          <div className='bg-[#faedcd] p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between'>
            <div><p className='text-sm opacity-70'>TOTAL</p><p className='text-4xl'>{stats.total}</p></div>
            <TargetIcon size={40} />
          </div>
          <div className='bg-[#d8e2dc] p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between'>
            <div><p className='text-sm opacity-70'>STREAK</p><p className='text-4xl'>{stats.streak} DAYS</p></div>
            <FlameIcon size={40} className={stats.streak > 0 ? "text-orange-500" : "text-gray-400"} />
          </div>
        </div>

        {/* Weekly Chart */}
        <div className='md:col-span-3 bg-white p-8 rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'>
          <h2 className='text-3xl mb-8 uppercase text-center'>Weekly Performance</h2>
          <div className='flex items-end justify-between h-48 gap-2 md:gap-4 border-b-4 border-black pb-2'>
            {[...Array(7)].map((_, i) => {
               const dayData = historyData[historyData.length - (7 - i)];
               const barHeight = dayData ? dayData.percent : 0;
               
               return (
                <div key={i} className='flex-1 flex flex-col justify-end items-center gap-2'>
                  <div 
                    style={{ height: `${Math.max(barHeight, 5)}%` }}
                    className={`w-full border-4 border-black rounded-t-xl transition-all duration-500 ${dayData?.isToday ? 'bg-orange-400' : 'bg-primary'} ${!dayData ? 'opacity-20' : 'opacity-100'}`}
                  ></div>
                  <span className={`text-[10px] md:text-sm uppercase ${dayData?.isToday ? 'font-bold' : ''}`}>
                    {dayData ? (dayData.isToday ? "Today" : dayData.date.split('/')[0] + '/' + dayData.date.split('/')[1]) : `--`}
                  </span>
                </div>
               )
            })}
          </div>
        </div>

        {/* Monthly Chart */}
        <div className='md:col-span-3 bg-white p-8 rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'>
          <h2 className='text-3xl mb-8 uppercase text-center flex items-center justify-center gap-3'>
            <CalendarIcon /> Monthly Momentum
          </h2>
          <div className='overflow-x-auto pb-4'>
            <div className='flex items-end h-32 gap-1 min-w-[800px] border-b-4 border-black'>
              {[...Array(30)].map((_, i) => {
                const dayData = historyData[historyData.length - (30 - i)];
                const barHeight = dayData ? dayData.percent : 0;
                return (
                  <div key={i} className='flex-1 flex flex-col justify-end items-center'>
                    <div 
                      style={{ height: `${Math.max(barHeight, 8)}%` }}
                      className={`w-full border-2 border-black rounded-t-sm transition-all duration-700 ${dayData?.isToday ? 'bg-orange-400' : 'bg-secondary'} ${!dayData ? 'opacity-10' : 'opacity-100'}`}
                    ></div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;