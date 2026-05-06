'use client';
import { CalendarDaysIcon } from '@/components/ui/calendar-days';
import { CheckCheckIcon } from '@/components/ui/check-check';
import { DeleteIcon } from '@/components/ui/delete';
import { ChevronDownIcon } from '@/components/ui/chevron-down';
import { LayoutDashboardIcon } from 'lucide-react'; // Using an icon for the dashboard
import React, { useEffect, useState } from 'react';
import Link from 'next/link'; // Assuming Next.js

interface Task {
  task: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  completed: boolean;
}

const Page = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [date, setDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [yesterdayCount, setYesterdayCount] = useState(0);

  const getToday = () => new Date().toLocaleDateString();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const today = getToday();
    setDate(today);
    const rawData = localStorage.getItem('task-data');
    const saved = rawData ? JSON.parse(rawData) : null;
    const yData = JSON.parse(localStorage.getItem('yesterday-data') || '[]');
    setYesterdayCount(yData.filter((t: Task) => t.completed).length);

    if (saved) {
      if (saved.date !== today) {
        localStorage.setItem('yesterday-data', JSON.stringify(saved.tasks));
        setTasks([{ task: '', status: 'Not Started', completed: false }]);
      } else {
        setTasks(saved.tasks);
      }
    } else {
      setTasks([{ task: '', status: 'Not Started', completed: false }]);
    }
  }, []);

  useEffect(() => {
    if (date) {
      localStorage.setItem('task-data', JSON.stringify({ date, tasks }));
    }
  }, [tasks, date]);

  const addTask = () => {
    setTasks([...tasks, { task: '', status: 'Not Started', completed: false }]);
  };

  const updateTask = (index: number, key: keyof Task, value: any) => {
    const updated = [...tasks];
    (updated[index] as any)[key] = value;

    if (key === 'status') {
      if (value === 'Done') updated[index].completed = true;
      else updated[index].completed = false;
    }

    if (key === 'completed') {
      updated[index].status = value ? 'Done' : 'In Progress';
    }

    setTasks(updated);
  };

useEffect(() => {
    const today = getToday();
    setDate(today);

    const rawData = localStorage.getItem('task-data');
    const saved = rawData ? JSON.parse(rawData) : null;
    
    // Load yesterday's count for the UI display
    const yData = JSON.parse(localStorage.getItem('yesterday-data') || '[]');
    setYesterdayCount(yData.filter((t: Task) => t.completed).length);

    if (saved) {
      if (saved.date !== today) {
        // --- NEW DAY ARCHIVE & RESET LOGIC ---
        
        // 1. Archive yesterday's progress to history for the Dashboard
        const history = JSON.parse(localStorage.getItem('mission-history') || '[]');
        const yesterdayStats = {
          date: saved.date,
          total: saved.tasks.length,
          completed: saved.tasks.filter((t: Task) => t.completed).length
        };

        // 2. Update the Streak if missions were finished
        if (yesterdayStats.completed > 0) {
          const oldStreak = parseInt(localStorage.getItem('mission-streak') || '0');
          localStorage.setItem('mission-streak', (oldStreak + 1).toString());
        }

        // 3. Update localStorage references
        localStorage.setItem('mission-history', JSON.stringify([...history, yesterdayStats]));
        localStorage.setItem('yesterday-data', JSON.stringify(saved.tasks));
        localStorage.setItem('last-active-date', today);

        // 4. PERSIST TASK NAMES BUT RESET PROGRESS
        // This maps through saved tasks, keeping the name but resetting status
        const resetTasks = saved.tasks.map((t: Task) => ({
          ...t,
          status: 'Not Started',
          completed: false
        }));
        setTasks(resetTasks);
        
      } else {
        // It's the same day, just load the current progress
        setTasks(saved.tasks);
      }
    } else {
      // First time initialization
      setTasks([{ task: '', status: 'Not Started', completed: false }]);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-[#ccd5ae]';
      case 'In Progress':
        return 'bg-[#d8e2dc]';
      default:
        return 'bg-[#fefae0]'; // Return a Tailwind class instead of a raw hex string
    }
  };

  return (
    <div className='p-6 md:p-10 min-h-screen bg-soft text-foreground relative pb-24'>
      {/* 🕒 Time display */}
      <div className='absolute top-6 right-6 md:top-10 md:right-10 font-luckiest text-2xl text-primary md:text-3xl'>
        {currentTime}
      </div>

      {/* 📊 Dashboard Link (Bottom Left) */}
      <div className='fixed bottom-6 left-6 md:bottom-10 md:left-10 z-50'>
        <Link href="/dashboard">
          <div className='flex items-center gap-3 bg-secondary border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer group'>
            <LayoutDashboardIcon size={28} className="group-hover:rotate-12 transition-transform" />
            <span className='font-luckiest text-xl md:text-2xl uppercase tracking-wider'>Dashboard</span>
          </div>
        </Link>
      </div>

      <h1 className='text-5xl md:text-7xl text-center mb-6 font-oi tracking-tighter'>
        Task Tracker
      </h1>

      <div className='flex items-center justify-center gap-3 mb-2 text-2xl font-luckiest text-light-bronze'>
        <CalendarDaysIcon size={28} /> <span>{date}</span>
      </div>

      <div className='flex items-center justify-center gap-2 mb-10 text-lg font-luckiest opacity-80'>
        <CheckCheckIcon size={20} />{' '}
        <span>Yesterday: {yesterdayCount} tasks finished</span>
      </div>

      <div className='max-w-4xl mx-auto border-4 border-primary rounded-3xl overflow-hidden shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-background'>
        <div className='grid grid-cols-4 bg-[#283618]] text-center p-5 text-[10px] md:text-xl border-b-4 border-primary font-luckiest'>
          <div className='uppercase'>Task Name</div>
          <div className='uppercase'>Status</div>
          <div className='uppercase'>Progress</div>
          <div className='uppercase'>Remove</div>
        </div>

        {tasks.map((item, i) => (
          <div
            key={i}
            className={`grid grid-cols-4 border-b-2 border-primary last:border-0 items-center transition-colors duration-300 ${getStatusColor(item.status)}`}
          >
            <input
              className='p-5 bg-transparent outline-none font-luckiest border-r-2 border-primary h-full placeholder:opacity-30'
              value={item.task}
              onChange={(e) => updateTask(i, 'task', e.target.value)}
              placeholder='Add a mission...'
            />

            <div className='relative h-full border-r-2 border-primary group'>
              <select
                className='w-full h-full p-5 bg-transparent outline-none font-luckiest cursor-pointer appearance-none'
                value={item.status}
                onChange={(e) => updateTask(i, 'status', e.target.value as any)}
              >
                <option value='Not Started'>Not Started</option>
                <option value='In Progress'>In Progress</option>
                <option value='Done'>Done</option>
              </select>
              <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:rotate-12 transition-transform'>
                <ChevronDownIcon size={20} />
              </div>
            </div>

            <div
              className='flex justify-center items-center border-r-2 border-primary h-full cursor-pointer'
              onClick={() => updateTask(i, 'completed', !item.completed)}
            >
              <div
                className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center transition-all ${item.completed ? 'bg-primary scale-110 shadow-[2px_2px_0px_black]' : 'bg-white'}`}
              >
                {item.completed && (
                  <CheckCheckIcon size={24} className='text-white' />
                )}
              </div>
            </div>

            <div
              onClick={() => removeTask(i)}
              className='flex justify-center items-center h-full hover:bg-red-400 transition-all cursor-pointer group'
            >
              <button className='text-red-500 group-hover:scale-125 group-active:scale-90 transition-transform cursor-pointer'>
                <DeleteIcon size={26} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className='text-center mt-12'>
        <button
          onClick={addTask}
          className='bg-primary text-white font-luckiest px-10 py-5 rounded-2xl cursor-pointer hover:translate-x-1 hover:-translate-y-1 transition-all border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[6px] active:translate-y-[6px]'
        >
          + ADD NEW TASK
        </button>
      </div>
    </div>
  );
};

export default Page;