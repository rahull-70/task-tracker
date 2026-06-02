'use client';

import { CalendarDaysIcon } from '@/components/ui/calendar-days';
import { CheckCheckIcon } from '@/components/ui/check-check';
import { DeleteIcon } from '@/components/ui/delete';
import { ChevronDownIcon } from '@/components/ui/chevron-down';
import { LayoutDashboardIcon, UserIcon, LogInIcon, Plus } from 'lucide-react';
import { CheckIcon } from '@/components/ui/check';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { createBrowserClient } from '@supabase/ssr';
import CommandMenu from '@/components/CommandMenu';

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

  // 1. Clock
  useEffect(() => {
    const now = new Date();
    setCurrentTime(
      now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    );
    setDate(
      now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    );

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

  // 2. Fetch
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

      if (error || !data) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      setYesterdayCount(
        data.filter((q) => {
          const d = new Date(q.created_at);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === yesterday.getTime() && q.completed;
        }).length,
      );

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

      setTasks(
        data.filter((q) => {
          const d = new Date(q.created_at);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === today.getTime();
        }),
      );
    };

    fetchQuests();
  }, [isLoggedIn, isLoading, user]);

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
    if (!error && data) setTasks([...tasks, data[0]]);
  };

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

  const removeTask = async (index: number) => {
    const taskToDelete = tasks[index];
    setTasks(tasks.filter((_, i) => i !== index));
    if (isLoggedIn && taskToDelete.id)
      await supabase.from('quests').delete().eq('id', taskToDelete.id);
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

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className='min-h-screen bg-soft text-foreground font-luckiest overflow-x-hidden'>
      <CommandMenu />

      {/* TOP NAV */}
      <div className='flex items-center justify-between px-4 sm:px-6 md:px-10 pt-4 sm:pt-6 md:pt-8'>
        {/* AUTH BUTTON */}
        <AnimatePresence mode='wait'>
          {!isLoading && (
            <motion.div
              key={isLoggedIn ? 'in' : 'out'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {isLoggedIn ? (
                <Link href='/user'>
                  <motion.div
                    whileHover={{ scale: 1.04, x: 3, y: 3, boxShadow: 'none' }}
                    whileTap={{ scale: 0.96 }}
                    className='flex items-center gap-1.5 sm:gap-2 bg-white border-4 border-black px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer group'
                  >
                    <UserIcon
                      size={18}
                      className='group-hover:text-primary group-hover:rotate-12 transition-transform flex-shrink-0'
                    />
                    <span className='text-xs sm:text-sm md:text-base uppercase tracking-tight truncate max-w-[80px] sm:max-w-[140px]'>
                      {user?.codename || 'COMMANDER'}
                    </span>
                  </motion.div>
                </Link>
              ) : (
                <Link href='/login'>
                  <motion.div
                    whileHover={{ scale: 1.04, x: 3, y: 3, boxShadow: 'none' }}
                    whileTap={{ scale: 0.96 }}
                    className='flex items-center gap-1.5 sm:gap-2 bg-white border-4 border-black px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer group'
                  >
                    <LogInIcon
                      size={18}
                      className='group-hover:translate-x-1 transition-transform flex-shrink-0'
                    />
                    <span className='text-xs sm:text-sm md:text-base uppercase tracking-tight'>
                      Sign In
                    </span>
                  </motion.div>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CLOCK */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='text-base sm:text-xl md:text-2xl text-primary tabular-nums'
        >
          {currentTime}
        </motion.div>
      </div>

      {/* HERO SECTION */}
      <div className='text-center px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6'>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-3xl sm:text-4xl md:text-5xl font-oi tracking-wide uppercase mb-2 sm:mb-3'
        >
          QuestBoard
        </motion.h1>

        {/* DATE + YESTERDAY */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className='flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-4 md:gap-6 text-light-bronze'
        >
          <span className='flex items-center gap-2 text-base sm:text-lg md:text-xl'>
            <CalendarDaysIcon size={18} /> {date}
          </span>
          <span className='hidden sm:block opacity-30'>·</span>
          <span className='flex items-center gap-2 text-xs sm:text-sm md:text-base opacity-70'>
            <CheckCheckIcon size={14} />
            Yesterday: {yesterdayCount}{' '}
            {yesterdayCount === 1 ? 'task' : 'tasks'} finished
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className='text-[10px] sm:text-[12px] uppercase tracking-widest opacity-20 mt-2 sm:mt-3 font-luckiest hidden md:block'
        >
          Press ⌘K to navigate
        </motion.p>
      </div>

      {/* PROGRESS BAR */}
      <AnimatePresence>
        {isLoggedIn && totalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className='max-w-4xl mx-auto px-4 sm:px-6 md:px-10 mb-3 sm:mb-4'
          >
            <div className='flex items-center justify-between text-xs sm:text-sm opacity-60 uppercase mb-1 sm:mb-1.5'>
              <span>
                {completedCount} of {totalCount} completed
              </span>
              <span>
                {totalCount > 0
                  ? Math.round((completedCount / totalCount) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className='h-2.5 sm:h-3 bg-white border-2 border-black rounded-full overflow-hidden'>
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className='h-full bg-primary rounded-full'
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MISSION TABLE */}
      <div className='max-w-6xl mx-auto px-3 sm:px-6 md:px-10 pb-28 sm:pb-32'>
        <div className='border-4 border-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white'>

          {/* ── DESKTOP TABLE (md+) ── */}
          <div className='hidden md:block'>
            {/* TABLE HEADER */}
            <div className='grid grid-cols-[2fr_0.8fr_0.8fr_1fr_0.6fr_0.5fr] bg-white border-b-4 border-black'>
              {['Quest', 'Priority', 'Duration', 'Status', 'Done', ''].map(
                (h, i) => (
                  <div
                    key={i}
                    className={`px-4 py-3 text-xs md:text-sm uppercase opacity-50 tracking-widest ${i > 0 ? 'text-center border-l-2 border-black/10' : 'pl-5'}`}
                  >
                    {h}
                  </div>
                ),
              )}
            </div>

            {/* ROWS */}
            <AnimatePresence mode='popLayout'>
              {tasks.length === 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='py-16 text-center'
                >
                  <div className='text-4xl mb-3'>⚔️</div>
                  <p className='uppercase opacity-30 text-sm tracking-widest'>No quests yet</p>
                  <p className='uppercase opacity-20 text-xs mt-1'>Add one below to begin</p>
                </motion.div>
              )}

              {tasks.map((item, i) => (
                <motion.div
                  layout
                  key={item.id || `local-${i}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`grid grid-cols-[2fr_0.8fr_0.8fr_1fr_0.6fr_0.5fr] border-b border-black/10 last:border-0 items-stretch ${getStatusColor(item.status)}`}
                >
                  <input
                    className={`px-5 py-4 bg-transparent outline-none text-sm md:text-base placeholder:opacity-25 font-luckiest ${item.completed ? 'line-through opacity-40' : ''}`}
                    value={item.task}
                    onChange={(e) => updateTask(i, 'task', e.target.value)}
                    placeholder='Add a mission...'
                  />
                  <div className={`relative border-l-2 border-black/10 ${getPriorityColor(item.priority)}`}>
                    <select
                      className='w-full h-full px-2 py-4 bg-transparent outline-none cursor-pointer appearance-none text-center text-xs font-luckiest'
                      value={item.priority}
                      onChange={(e) => updateTask(i, 'priority', e.target.value)}
                    >
                      <option value='None'>—</option>
                      <option value='Low'>Low</option>
                      <option value='Mid'>Mid</option>
                      <option value='High'>High</option>
                    </select>
                    <ChevronDownIcon size={10} className='absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40' />
                  </div>
                  <input
                    className='px-3 py-4 bg-transparent outline-none border-l-2 border-black/10 text-center text-xs placeholder:opacity-25 font-luckiest'
                    value={item.duration}
                    onChange={(e) => updateTask(i, 'duration', e.target.value)}
                    placeholder='30m'
                  />
                  <div className='relative border-l-2 border-black/10'>
                    <select
                      className='w-full h-full px-2 py-4 bg-transparent outline-none cursor-pointer appearance-none text-center text-xs font-luckiest'
                      value={item.status}
                      onChange={(e) => updateTask(i, 'status', e.target.value)}
                    >
                      <option value='Not Started'>Not Started</option>
                      <option value='In Progress'>In Progress</option>
                      <option value='Done'>Done</option>
                    </select>
                    <ChevronDownIcon size={10} className='absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40' />
                  </div>
                  <div
                    className='flex justify-center items-center border-l-2 border-black/10 cursor-pointer'
                    onClick={() => updateTask(i, 'completed', !item.completed)}
                  >
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      className={`w-7 h-7 rounded-lg border-2 border-black flex items-center justify-center transition-all ${item.completed ? 'bg-primary shadow-[2px_2px_0px_black]' : 'bg-white'}`}
                    >
                      {item.completed && <CheckIcon size={16} className='text-white' />}
                    </motion.div>
                  </div>
                  <div
                    onClick={() => removeTask(i)}
                    className='flex justify-center items-center border-l-2 border-black/10 cursor-pointer hover:bg-red-50 transition-colors group'
                  >
                    <DeleteIcon size={18} className='text-black/20 group-hover:text-red-400 transition-colors' />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── MOBILE CARDS (below md) ── */}
          <div className='block md:hidden'>
            <AnimatePresence mode='popLayout'>
              {tasks.length === 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='py-14 text-center'
                >
                  <div className='text-4xl mb-3'>⚔️</div>
                  <p className='uppercase opacity-30 text-sm tracking-widest'>No quests yet</p>
                  <p className='uppercase opacity-20 text-xs mt-1'>Add one below to begin</p>
                </motion.div>
              )}

              {tasks.map((item, i) => (
                <motion.div
                  layout
                  key={item.id || `local-${i}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`border-b border-black/10 last:border-0 p-3 ${getStatusColor(item.status)}`}
                >
                  {/* Row 1: task input + check + delete */}
                  <div className='flex items-center gap-2 mb-2'>
                    <input
                      className={`flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:opacity-25 font-luckiest ${item.completed ? 'line-through opacity-40' : ''}`}
                      value={item.task}
                      onChange={(e) => updateTask(i, 'task', e.target.value)}
                      placeholder='Add a mission...'
                    />
                    {/* Check */}
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      onClick={() => updateTask(i, 'completed', !item.completed)}
                      className={`w-7 h-7 rounded-lg border-2 border-black flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${item.completed ? 'bg-primary shadow-[2px_2px_0px_black]' : 'bg-white'}`}
                    >
                      {item.completed && <CheckIcon size={14} className='text-white' />}
                    </motion.div>
                    {/* Delete */}
                    <div
                      onClick={() => removeTask(i)}
                      className='w-7 h-7 flex items-center justify-center flex-shrink-0 cursor-pointer group'
                    >
                      <DeleteIcon size={16} className='text-black/20 group-hover:text-red-400 transition-colors' />
                    </div>
                  </div>

                  {/* Row 2: priority + duration + status — all inline */}
                  <div className='flex items-center gap-2'>
                    {/* Priority */}
                    <div className={`relative flex-1 rounded-lg border-2 border-black/15 ${getPriorityColor(item.priority)}`}>
                      <select
                        className='w-full px-2 py-1.5 bg-transparent outline-none cursor-pointer appearance-none text-center text-[10px] font-luckiest'
                        value={item.priority}
                        onChange={(e) => updateTask(i, 'priority', e.target.value)}
                      >
                        <option value='None'>Priority</option>
                        <option value='Low'>Low</option>
                        <option value='Mid'>Mid</option>
                        <option value='High'>High</option>
                      </select>
                      <ChevronDownIcon size={8} className='absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-40' />
                    </div>

                    {/* Duration */}
                    <input
                      className='flex-1 px-2 py-1.5 bg-white/60 border-2 border-black/15 rounded-lg outline-none text-center text-[10px] placeholder:opacity-30 font-luckiest'
                      value={item.duration}
                      onChange={(e) => updateTask(i, 'duration', e.target.value)}
                      placeholder='Duration'
                    />

                    {/* Status */}
                    <div className='relative flex-1 rounded-lg border-2 border-black/15 bg-white/60'>
                      <select
                        className='w-full px-2 py-1.5 bg-transparent outline-none cursor-pointer appearance-none text-center text-[10px] font-luckiest'
                        value={item.status}
                        onChange={(e) => updateTask(i, 'status', e.target.value)}
                      >
                        <option value='Not Started'>Not Started</option>
                        <option value='In Progress'>In Progress</option>
                        <option value='Done'>Done</option>
                      </select>
                      <ChevronDownIcon size={8} className='absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-40' />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ADD ROW */}
          <motion.button
            whileHover={{ backgroundColor: '#f5f0e8' }}
            whileTap={{ scale: 0.99 }}
            onClick={addTask}
            className='w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-t-4 border-black bg-white text-black/40 hover:text-black/70 transition-colors cursor-pointer'
          >
            <Plus size={15} />
            <span className='text-xs sm:text-sm uppercase tracking-widest'>Add quest</span>
          </motion.button>
        </div>
      </div>

      {/* DASHBOARD BUTTON */}
      <AnimatePresence>
        {!isLoading && isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className='fixed bottom-4 sm:bottom-6 left-4 sm:left-6 md:bottom-8 md:left-8 z-50'
          >
            <Link href='/dashboard'>
              <motion.div
                whileHover={{ scale: 1.05, x: 4, y: 4, boxShadow: 'none' }}
                whileTap={{ scale: 0.95 }}
                className='flex items-center gap-2 bg-white border-4 border-black px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer group'
              >
                <LayoutDashboardIcon
                  size={20}
                  className='group-hover:rotate-12 transition-transform'
                />
                <span className='text-sm sm:text-base uppercase'>Dashboard</span>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Page;