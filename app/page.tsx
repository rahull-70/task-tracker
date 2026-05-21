'use client';

import { CalendarDaysIcon } from '@/components/ui/calendar-days';
import { CheckCheckIcon } from '@/components/ui/check-check';
import { DeleteIcon } from '@/components/ui/delete';
import { ChevronDownIcon } from '@/components/ui/chevron-down';
import { LayoutDashboardIcon, UserIcon, LogInIcon } from 'lucide-react';
import { CheckIcon } from '@/components/ui/check';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { createBrowserClient } from '@supabase/ssr';

interface Task {
  id?: string;
  task: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  completed: boolean;
  priority: 'None' | 'Low' | 'Mid' | 'High';
  duration: string;
  created_at?: string;
}

const Page = () => {
  const { isLoggedIn, isLoading, user } = useAuth();

  // Create supabase client once using ref to avoid re-renders
  const supabaseRef = useRef(
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ),
  );
  const supabase = supabaseRef.current;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [date, setDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [yesterdayCount, setYesterdayCount] = useState(0);

  // Set date immediately on mount — no useEffect needed
  const todayStr = new Date().toLocaleDateString();

  // 1. Clock Timer
  useEffect(() => {
    // Set immediately
    const now = new Date();
    setCurrentTime(
      now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    );
    setDate(new Date().toLocaleDateString());

    const timer = setInterval(() => {
      const n = new Date();
      setCurrentTime(
        n.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Tasks + yesterday count + daily reset
  useEffect(() => {
    if (isLoading) return;

    if (!isLoggedIn || !user?.id) {
      setTasks([]);
      return;
    }

    const fetchQuests = async () => {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error:', error.message);
        return;
      }

      if (!data) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Count yesterday's completed tasks
      const yesterdayDone = data.filter((q) => {
        const d = new Date(q.created_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === yesterday.getTime() && q.completed;
      }).length;
      setYesterdayCount(yesterdayDone);

      // Daily reset — mark old incomplete tasks as 'Not Started'
      // Only reset tasks from previous days that are not done
      const staleIds = data
        .filter((q) => {
          const d = new Date(q.created_at);
          d.setHours(0, 0, 0, 0);
          return (
            d.getTime() < today.getTime() &&
            !q.completed &&
            q.status !== 'Not Started'
          );
        })
        .map((q) => q.id);

      if (staleIds.length > 0) {
        await supabase
          .from('quests')
          .update({ status: 'Not Started', completed: false })
          .in('id', staleIds);
      }

      // Show only today's tasks
      const todayTasks = data.filter((q) => {
        const d = new Date(q.created_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });

      setTasks(todayTasks);
    };

    fetchQuests();
  }, [isLoggedIn, isLoading, user]);

  // 3. Add Task
  const addTask = async () => {
    if (!isLoggedIn || !user) {
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
      return;
    }

    const { data, error } = await supabase
      .from('quests')
      .insert([
        {
          user_id: user.id,
          task: '',
          status: 'Not Started',
          priority: 'None',
          duration: '',
          completed: false,
        },
      ])
      .select();

    if (error) {
      console.error('Add task error:', error.message);
      return;
    }
    if (data) setTasks([...tasks, data[0]]);
  };

  // 4. Update Task
  const updateTask = async (
    index: number,
    key: keyof Task,
    value: string | boolean,
  ) => {
    const updated = [...tasks];
    const taskToUpdate = updated[index];

    (updated[index] as unknown as Record<string, unknown>)[key] = value;
    if (key === 'status') updated[index].completed = value === 'Done';
    if (key === 'completed')
      updated[index].status = value ? 'Done' : 'In Progress';

    setTasks(updated);

    if (isLoggedIn && taskToUpdate.id) {
      await supabase
        .from('quests')
        .update({
          [key]: value,
          status: updated[index].status,
          completed: updated[index].completed,
        })
        .eq('id', taskToUpdate.id);
    }
  };

  // 5. Remove Task
  const removeTask = async (index: number) => {
    const taskToDelete = tasks[index];
    setTasks(tasks.filter((_, i) => i !== index));
    if (isLoggedIn && taskToDelete.id) {
      await supabase.from('quests').delete().eq('id', taskToDelete.id);
    }
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
      {/* AUTH BUTTON */}
      <div className='absolute top-6 left-6 md:top-10 md:left-10 z-50'>
        <AnimatePresence mode='wait'>
          {!isLoading && (
            <motion.div
              key={isLoggedIn ? 'logged-in' : 'logged-out'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            >
              {isLoggedIn ? (
                <Link href='/user'>
                  <motion.div
                    whileHover={{ scale: 1.05, x: 5, y: 5, boxShadow: 'none' }}
                    whileTap={{ scale: 0.95 }}
                    className='flex items-center gap-3 bg-white border-4 border-black p-3 px-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer group text-black select-none'
                  >
                    <UserIcon
                      size={24}
                      className='group-hover:text-primary group-hover:rotate-12 transition-transform'
                    />
                    <span className='text-md md:text-xl uppercase tracking-tight'>
                      {user?.codename || 'COMMANDER'}
                    </span>
                  </motion.div>
                </Link>
              ) : (
                <Link href='/login'>
                  <motion.div
                    whileHover={{ scale: 1.05, x: 5, y: 5, boxShadow: 'none' }}
                    whileTap={{ scale: 0.95 }}
                    className='flex items-center gap-3 bg-white border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer group text-black select-none'
                  >
                    <LogInIcon
                      size={28}
                      className='group-hover:translate-x-1 transition-transform'
                    />
                    <span className='text-md md:text-xl uppercase tracking-tight'>
                      Sign In
                    </span>
                  </motion.div>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CLOCK */}
      <motion.div className='absolute top-6 right-6 md:top-10 md:right-10 text-2xl text-primary md:text-3xl'>
        {currentTime}
      </motion.div>

      {/* DASHBOARD BUTTON */}
      <AnimatePresence>
        {!isLoading && isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className='fixed bottom-6 left-6 md:bottom-10 md:left-10 z-50'
          >
            <Link href='/dashboard'>
              <motion.div
                whileHover={{ scale: 1.05, x: 5, y: 5, boxShadow: 'none' }}
                whileTap={{ scale: 0.95 }}
                className='flex items-center gap-3 bg-white border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer group'
              >
                <LayoutDashboardIcon
                  size={28}
                  className='group-hover:rotate-12 transition-transform'
                />
                <span className='text-md md:text-xl uppercase'>Dashboard</span>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.h1 className='text-3xl md:text-7xl text-center mb-6 font-oi tracking-wide md:mt-0 mt-20 uppercase'>
        QuestBoard
      </motion.h1>

      <div className='flex items-center justify-center gap-3 mb-2 text-2xl text-light-bronze'>
        <CalendarDaysIcon size={28} /> <span>{date}</span>
      </div>

      <div className='flex items-center justify-center gap-2 mb-10 text-lg opacity-80'>
        <CheckCheckIcon size={20} />
        <span>
          Yesterday: {yesterdayCount} {yesterdayCount === 1 ? 'task' : 'tasks'}{' '}
          finished
        </span>
      </div>

      {/* MISSION TABLE */}
      <div className='max-w-6xl mx-auto border-4 border-black rounded-3xl overflow-hidden shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-background'>
        <div className='overflow-x-auto overflow-y-hidden'>
          <div className='min-w-[850px] overflow-hidden'>
            <div className='grid grid-cols-[2fr_1fr_1fr_1.2fr_0.8fr_0.8fr] text-center bg-white p-5 text-sm md:text-xl border-b-4 border-black'>
              <div className='uppercase'>Quest</div>
              <div className='uppercase'>Priority</div>
              <div className='uppercase'>Duration</div>
              <div className='uppercase'>Status</div>
              <div className='uppercase'>Check</div>
              <div className='uppercase'>Abort</div>
            </div>

            <AnimatePresence mode='popLayout'>
              {tasks.length === 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='p-10 text-center opacity-40 uppercase text-lg'
                >
                  No quests yet. Add one below!
                </motion.div>
              )}
              {tasks.map((item, i) => (
                <motion.div
                  layout
                  key={item.id || `local-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`grid grid-cols-[2fr_1fr_1fr_1.2fr_0.8fr_0.8fr] border-b-2 border-black last:border-0 items-center ${getStatusColor(item.status)}`}
                >
                  <input
                    className={`p-5 bg-transparent outline-none border-r-2 border-black h-full placeholder:opacity-30 ${item.completed ? 'line-through opacity-50' : ''}`}
                    value={item.task}
                    onChange={(e) => updateTask(i, 'task', e.target.value)}
                    placeholder='Add a mission...'
                  />

                  <div
                    className={`relative h-full border-r-2 border-black ${getPriorityColor(item.priority)}`}
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
                    <ChevronDownIcon
                      size={14}
                      className='absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none'
                    />
                  </div>

                  <input
                    className='p-5 bg-transparent outline-none border-r-2 border-black h-full text-center placeholder:opacity-30'
                    value={item.duration}
                    onChange={(e) => updateTask(i, 'duration', e.target.value)}
                    placeholder='e.g. 30m'
                  />

                  <div className='relative h-full border-r-2 border-black'>
                    <select
                      className='w-full h-full p-5 bg-transparent outline-none cursor-pointer appearance-none text-center'
                      value={item.status}
                      onChange={(e) => updateTask(i, 'status', e.target.value)}
                    >
                      <option value='Not Started'>Not Started</option>
                      <option value='In Progress'>In Progress</option>
                      <option value='Done'>Done</option>
                    </select>
                    <ChevronDownIcon
                      size={14}
                      className='absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none'
                    />
                  </div>

                  <div
                    className='flex justify-center items-center border-r-2 border-black h-full cursor-pointer'
                    onClick={() => updateTask(i, 'completed', !item.completed)}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl border-2 border-black flex items-center justify-center transition-all ${item.completed ? 'bg-primary scale-110 shadow-[2px_2px_0px_black]' : 'bg-white'}`}
                    >
                      {item.completed && (
                        <CheckIcon size={20} className='text-white' />
                      )}
                    </div>
                  </div>

                  <div
                    onClick={() => removeTask(i)}
                    className='flex justify-center items-center h-full hover:bg-red-400 transition-all cursor-pointer group'
                  >
                    <DeleteIcon
                      size={26}
                      className='text-red-500 group-hover:text-white transition-colors'
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className='text-center mt-12'>
        <motion.button
          whileHover={{ scale: 1.05, x: 4, y: 4, boxShadow: 'none' }}
          whileTap={{ scale: 0.95 }}
          onClick={addTask}
          className='bg-primary border-4 text-white border-black py-5 px-8 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer uppercase'
        >
          + ADD NEW Quest
        </motion.button>
      </div>
    </div>
  );
};

export default Page;
