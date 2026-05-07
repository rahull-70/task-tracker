'use client';
import { CalendarDaysIcon } from '@/components/ui/calendar-days';
import { CheckCheckIcon } from '@/components/ui/check-check';
import { DeleteIcon } from '@/components/ui/delete';
import { ChevronDownIcon } from '@/components/ui/chevron-down';
import { LayoutDashboardIcon, UserIcon, LogInIcon } from 'lucide-react'; // Added Auth Icons
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Auth State Placeholder

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
        const history = JSON.parse(
          localStorage.getItem('mission-history') || '[]',
        );
        const yesterdayStats = {
          date: saved.date,
          total: saved.tasks.length,
          completed: saved.tasks.filter((t: Task) => t.completed).length,
        };

        if (yesterdayStats.completed > 0) {
          const oldStreak = parseInt(
            localStorage.getItem('mission-streak') || '0',
          );
          localStorage.setItem('mission-streak', (oldStreak + 1).toString());
        }

        localStorage.setItem(
          'mission-history',
          JSON.stringify([...history, yesterdayStats]),
        );
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
      setTasks([
        {
          task: '',
          status: 'Not Started',
          completed: false,
          priority: 'None',
          duration: '',
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (date) {
      localStorage.setItem('task-data', JSON.stringify({ date, tasks }));
    }
  }, [tasks, date]);

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        task: '',
        status: 'Not Started',
        completed: false,
        priority: 'None',
        duration: '',
      },
    ]);
  };

  const updateTask = (index: number, key: keyof Task, value: any) => {
    const updated = [...tasks];
    (updated[index] as any)[key] = value;
    if (key === 'status') updated[index].completed = value === 'Done';
    if (key === 'completed')
      updated[index].status = value ? 'Done' : 'In Progress';
    setTasks(updated);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-[#ccd5ae]';
      case 'In Progress':
        return 'bg-[#d8e2dc]';
      default:
        return 'bg-[#fefae0]';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-[#ffadad]';
      case 'Mid':
        return 'bg-[#ffd6a5]';
      case 'Low':
        return 'bg-[#caffbf]';
      default:
        return 'bg-transparent';
    }
  };

  return (
    <div className='p-6 md:p-10 min-h-screen bg-soft text-foreground relative pb-24 font-luckiest overflow-x-hidden'>
      {/* AUTH BUTTON - TOP LEFT */}
      <div className='absolute top-6 left-6 md:top-10 md:left-10 z-50'>
        <motion.button
          whileHover={{ scale: 1.05, x: 5, y: 5, boxShadow: 'none' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsLoggedIn(!isLoggedIn)}
          className='flex items-center gap-3 bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group'
        >
          {isLoggedIn ? (
            <>
              <UserIcon
                size={24}
                className='group-hover:text-primary transition-colors'
              />
              <span className='hidden md:inline uppercase text-lg'>
                Commander
              </span>
            </>
          ) : (
            <>
              <LogInIcon
                size={24}
                className='group-hover:translate-x-1 transition-transform'
              />
              <span className='hidden md:inline uppercase text-lg'>
                Sign In
              </span>
            </>
          )}
        </motion.button>
      </div>

      {/* CLOCK - TOP RIGHT */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='absolute top-6 right-6 md:top-10 md:right-10 text-2xl text-primary md:text-3xl'
      >
        {currentTime}
      </motion.div>

      {/* DASHBOARD BUTTON - FIXED BOTTOM LEFT */}
      <div className='fixed bottom-6 left-6 md:bottom-10 md:left-10 z-50'>
        <Link href='/dashboard'>
          <motion.div
            whileHover={{ scale: 1.05, x: 5, y: -5, boxShadow: 'none' }}
            whileTap={{ scale: 0.95 }}
            className='flex items-center gap-3 bg-white border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group'
          >
            <LayoutDashboardIcon
              size={28}
              className='group-hover:rotate-12 transition-transform'
            />
            <span className='text-xl md:text-2xl uppercase tracking-wider'>
              Dashboard
            </span>
          </motion.div>
        </Link>
      </div>

      {/* MAIN TITLE */}
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className='text-3xl md:text-7xl text-center mb-6 font-oi tracking-wide md:mt-0 mt-20 uppercase'
      >
        QuestBoard
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className='flex items-center justify-center gap-3 mb-2 text-2xl text-light-bronze'
      >
        <CalendarDaysIcon size={28} /> <span>{date}</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className='flex items-center justify-center gap-2 mb-10 text-lg opacity-80'
      >
        <CheckCheckIcon size={20} />{' '}
        <span>Yesterday: {yesterdayCount} tasks finished</span>
      </motion.div>

      {/* MISSION TABLE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className='max-w-6xl mx-auto border-4 border-black rounded-3xl overflow-hidden shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-background'
      >
        <div className='overflow-x-auto'>
          <div className='min-w-[850px]'>
            <div className='grid grid-cols-[2fr_1fr_1fr_1.2fr_0.8fr_0.8fr] text-center font-luckiest bg-white p-5 text-sm md:text-xl border-b-4 border-black'>
              <div className='uppercase whitespace-nowrap'>Quest</div>
              <div className='uppercase whitespace-nowrap'>Priority</div>
              <div className='uppercase whitespace-nowrap'>Duration</div>
              <div className='uppercase whitespace-nowrap'>Status</div>
              <div className='uppercase whitespace-nowrap'>Check</div>
              <div className='uppercase whitespace-nowrap'>Abort</div>
            </div>

            <AnimatePresence>
              {tasks.map((item, i) => (
                <motion.div
                  layout
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className={`grid grid-cols-[2fr_1fr_1fr_1.2fr_0.8fr_0.8fr] border-b-2 border-black last:border-0 items-center transition-all duration-300 ${getStatusColor(item.status)}`}
                >
                  <input
                    className={`p-5 bg-transparent outline-none border-r-2 border-black h-full placeholder:opacity-30 transition-all ${item.completed ? 'line-through opacity-50' : ''}`}
                    value={item.task}
                    onChange={(e) => updateTask(i, 'task', e.target.value)}
                    placeholder='Add a mission...'
                  />

                  <div
                    className={`relative h-full border-r-2 border-black group transition-colors ${getPriorityColor(item.priority)}`}
                  >
                    <select
                      className='w-full h-full p-5 bg-transparent outline-none cursor-pointer appearance-none text-center font-luckiest'
                      value={item.priority}
                      onChange={(e) =>
                        updateTask(i, 'priority', e.target.value)
                      }
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
                    className='p-5 bg-transparent outline-none border-r-2 border-black h-full text-center placeholder:opacity-30'
                    value={item.duration}
                    onChange={(e) => updateTask(i, 'duration', e.target.value)}
                    placeholder='e.g. 30m'
                  />

                  <div className='relative h-full border-r-2 border-black group'>
                    <select
                      className='w-full h-full p-5 bg-transparent outline-none cursor-pointer appearance-none text-center whitespace-nowrap'
                      value={item.status}
                      onChange={(e) =>
                        updateTask(i, 'status', e.target.value as any)
                      }
                    >
                      <option value='Not Started'>Not Started</option>
                      <option value='In Progress'>In Progress</option>
                      <option value='Done'>Done</option>
                    </select>
                    <div className='absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover:rotate-12 transition-transform'>
                      <ChevronDownIcon size={14} />
                    </div>
                  </div>

                  <div
                    className='flex justify-center items-center border-r-2 border-black h-full cursor-pointer'
                    onClick={() => updateTask(i, 'completed', !item.completed)}
                  >
                    <motion.div
                      whileTap={{ scale: 0.8 }}
                      className={`w-8 h-8 rounded-xl border-2 border-black flex items-center justify-center transition-all ${item.completed ? 'bg-primary scale-110 shadow-[2px_2px_0px_black]' : 'bg-white'}`}
                    >
                      {item.completed && (
                        <CheckCheckIcon size={20} className='text-white' />
                      )}
                    </motion.div>
                  </div>

                  <div
                    onClick={() => removeTask(i)}
                    className='flex justify-center items-center h-full hover:bg-red-400 transition-all cursor-pointer group'
                  >
                    <motion.button
                      whileHover={{ rotate: 90, scale: 1.2 }}
                      className='text-red-500 cursor-pointer'
                    >
                      <DeleteIcon size={26} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ADD MISSION BUTTON */}
      <div className='text-center mt-12'>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: 'none', x: 4, y: 4 }}
          whileTap={{ scale: 0.95 }}
          onClick={addTask}
          className='bg-primary border-4 text-white border-black py-5 px-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group font-luckiest'
        >
          + ADD NEW QUest
        </motion.button>
      </div>
    </div>
  );
};

export default Page;
