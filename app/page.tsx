'use client';
import { CalendarDaysIcon } from '@/components/ui/calendar-days';
import { CheckCheckIcon } from '@/components/ui/check-check';
import { DeleteIcon } from '@/components/ui/delete';
import { ChevronDownIcon } from '@/components/ui/chevron-down';
import { LayoutDashboardIcon, ClockIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Task {
  task: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  completed: boolean;
  priority: 'None' | 'Low' | 'Mid' | 'High';
  duration: string; 
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
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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
        const history = JSON.parse(localStorage.getItem('mission-history') || '[]');
        const yesterdayStats = {
          date: saved.date,
          total: saved.tasks.length,
          completed: saved.tasks.filter((t: Task) => t.completed).length,
        };

        if (yesterdayStats.completed > 0) {
          const oldStreak = parseInt(localStorage.getItem('mission-streak') || '0');
          localStorage.setItem('mission-streak', (oldStreak + 1).toString());
        }

        localStorage.setItem('mission-history', JSON.stringify([...history, yesterdayStats]));
        localStorage.setItem('yesterday-data', JSON.stringify(saved.tasks));
        localStorage.setItem('last-active-date', today);

        const resetTasks = saved.tasks.map((t: Task) => ({
          ...t,
          status: 'Not Started',
          completed: false,
        }));
        setTasks(resetTasks);
      } else {
        setTasks(saved.tasks);
      }
    } else {
      setTasks([{ task: '', status: 'Not Started', completed: false, priority: 'None', duration: '' }]);
    }
  }, []);

  useEffect(() => {
    if (date) {
      localStorage.setItem('task-data', JSON.stringify({ date, tasks }));
    }
  }, [tasks, date]);

  const addTask = () => {
    setTasks([...tasks, { task: '', status: 'Not Started', completed: false, priority: 'None', duration: '' }]);
  };

  const updateTask = (index: number, key: keyof Task, value: any) => {
    const updated = [...tasks];
    (updated[index] as any)[key] = value;
    if (key === 'status') updated[index].completed = value === 'Done';
    if (key === 'completed') updated[index].status = value ? 'Done' : 'In Progress';
    setTasks(updated);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-[#ccd5ae]';
      case 'In Progress': return 'bg-[#d8e2dc]';
      default: return 'bg-[#fefae0]';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-[#ffadad]';
      case 'Mid': return 'bg-[#ffd6a5]';
      case 'Low': return 'bg-[#caffbf]';
      default: return 'bg-transparent';
    }
  };

  return (
    <div className='p-6 md:p-10 min-h-screen bg-soft text-foreground relative pb-24 font-luckiest'>
      <div className='absolute top-6 right-6 md:top-10 md:right-10 text-2xl text-primary md:text-3xl'>
        {currentTime}
      </div>

      <div className='fixed bottom-6 left-6 md:bottom-10 md:left-10 z-50'>
        <Link href='/dashboard'>
          <div className='flex items-center gap-3 bg-white border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer group'>
            <LayoutDashboardIcon size={28} className='group-hover:rotate-12 transition-transform' />
            <span className='text-xl md:text-2xl uppercase tracking-wider'>Dashboard</span>
          </div>
        </Link>
      </div>

      <h1 className='text-5xl md:text-7xl text-center mb-6 font-oi tracking-tighter md:mt-0 mt-10'>Task Tracker</h1>

      <div className='flex items-center justify-center gap-3 mb-2 text-2xl text-light-bronze'>
        <CalendarDaysIcon size={28} /> <span>{date}</span>
      </div>

      <div className='flex items-center justify-center gap-2 mb-10 text-lg opacity-80'>
        <CheckCheckIcon size={20} /> <span>Yesterday: {yesterdayCount} tasks finished</span>
      </div>

      {/* MOBILE FIX: Added overflow-x-auto to the outer container */}
      <div className='max-w-6xl mx-auto border-4 border-black rounded-3xl overflow-x-auto shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-background'>
        {/* Set a min-width so the table doesn't squash on mobile */}
        <div className='min-w-[800px] md:min-w-full'>
            {/* Header updated to grid-cols-6 */}
            <div className='grid grid-cols-6 text-center p-5 text-sm md:text-lg border-b-4 border-black '>
              <div className='uppercase'>Mission</div>
              <div className='uppercase'>Priority</div>
              <div className='uppercase'>Duration</div>
              <div className='uppercase'>Status</div>
              <div className='uppercase'>Check</div>
              <div className='uppercase'>Abort</div>
            </div>

            {tasks.map((item, i) => (
              <div key={i} className={`grid grid-cols-6 border-b-2 border-black last:border-0 items-center transition-all duration-300 ${getStatusColor(item.status)}`}>
                <input
                  className={`p-3 md:p-5 bg-transparent outline-none border-r-2 border-black h-full placeholder:opacity-30 transition-all ${item.completed ? 'line-through opacity-50' : ''}`}
                  value={item.task}
                  onChange={(e) => updateTask(i, 'task', e.target.value)}
                  placeholder='Add a mission...'
                />

                <div className={`relative h-full border-r-2 border-black group transition-colors ${getPriorityColor(item.priority)}`}>
                  <select
                    className='w-full h-full p-3 md:p-5 bg-transparent outline-none cursor-pointer appearance-none text-center font-luckiest'
                    value={item.priority}
                    onChange={(e) => updateTask(i, 'priority', e.target.value)}
                  >
                    <option value='None'>None</option>
                    <option value='Low'>Low</option>
                    <option value='Mid'>Mid</option>
                    <option value='High'>High</option>
                  </select>
                  <div className='absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover:rotate-12 transition-transform'>
                    <ChevronDownIcon size={14} />
                  </div>
                </div>

                <input
                  className='p-3 md:p-5 bg-transparent outline-none border-r-2 border-black h-full text-center placeholder:opacity-30'
                  value={item.duration}
                  onChange={(e) => updateTask(i, 'duration', e.target.value)}
                  placeholder='e.g. 30m'
                />

                <div className='relative h-full border-r-2 border-black group'>
                  <select
                    className='w-full h-full p-3 md:p-5 bg-transparent outline-none cursor-pointer appearance-none text-center'
                    value={item.status}
                    onChange={(e) => updateTask(i, 'status', e.target.value as any)}
                  >
                    <option value='Not Started'>Not Started</option>
                    <option value='In Progress'>In Progress</option>
                    <option value='Done'>Done</option>
                  </select>
                  <div className='absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover:rotate-12 transition-transform'>
                    <ChevronDownIcon size={14} />
                  </div>
                </div>

                <div className='flex justify-center items-center border-r-2 border-black h-full cursor-pointer' onClick={() => updateTask(i, 'completed', !item.completed)}>
                  <div className={`w-8 h-8 rounded-xl border-2 border-black flex items-center justify-center transition-all ${item.completed ? 'bg-primary scale-110 shadow-[2px_2px_0px_black]' : 'bg-white'}`}>
                    {item.completed && <CheckCheckIcon size={20} className='text-white' />}
                  </div>
                </div>

                <div onClick={() => removeTask(i)} className='flex justify-center items-center h-full hover:bg-red-400 transition-all cursor-pointer group'>
                  <button className='text-red-500 group-hover:scale-125 transition-transform'>
                    <DeleteIcon size={26} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className='text-center mt-12'>
        <button onClick={addTask} className='bg-primary border-4 text-white border-black py-5 px-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer group'>
          + ADD NEW MISSION
        </button>
      </div>
    </div>
  );
};

export default Page;