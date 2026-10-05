'use client';

import { CalendarDaysIcon } from '@/components/ui/calendar-days';
import { CheckCheckIcon } from '@/components/ui/check-check';
import { DeleteIcon } from '@/components/ui/delete';
import { ChevronDownIcon } from '@/components/ui/chevron-down';
import {
  LayoutDashboardIcon,
  UserIcon,
  LogInIcon,
  HomeIcon,
  Plus,
  Pin,
  PinOff,
} from 'lucide-react';
import { CheckIcon } from '@/components/ui/check';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { createBrowserClient } from '@supabase/ssr';
import CommandMenu from '@/components/ui/CommandMenu';

interface Task {
  id?: string;
  task: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  completed: boolean;
  priority: 'None' | 'Low' | 'Mid' | 'High';
  duration: string;
  created_at?: string;
  last_reset_at?: string;
  is_persistent: boolean;
  isOptimistic?: boolean;
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
  const [yesterdayCount, setYesterdayCount] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Date
  useEffect(() => {
    const now = new Date();
    setDate(
      now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    );
  }, []);

  // Fetch + auto-reset only non-persistent tasks
  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn || !user?.id) {
      setTasks([]);
      setHasLoaded(true);
      return;
    }

    const fetchQuests = async () => {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error || !data) {
        setHasLoaded(true);
        return;
      }

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

      // Auto-reset only NON-persistent tasks
      const staleIds = data
        .filter((q) => {
          if (q.is_persistent) return false;
          const d = new Date(q.last_reset_at || q.created_at);
          d.setHours(0, 0, 0, 0);
          const isOld = d.getTime() < today.getTime();
          const wasActive = q.completed || q.status !== 'Not Started';
          return isOld && wasActive;
        })
        .map((q) => q.id);

      if (staleIds.length > 0) {
        await supabase
          .from('quests')
          .update({
            status: 'Not Started',
            completed: false,
            last_reset_at: today.toISOString(),
          })
          .in('id', staleIds);
      }

      // Refetch to get fresh values
      const { data: refreshed } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      const source = refreshed || data;

      const filtered = source.filter((q) => {
        if (q.is_persistent) return true;
        const d = new Date(q.last_reset_at || q.created_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });

      // Mark all fetched tasks as non-optimistic so they don't re-animate
      setTasks(filtered.map((t) => ({ ...t, isOptimistic: false })));
      setHasLoaded(true);
    };

    fetchQuests();
  }, [isLoggedIn, isLoading, user, supabase]);

  // ========================================================================
  // ADD with optimistic UI
  // ========================================================================
  const addTask = async () => {
    const tempId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const optimisticTask: Task = {
      id: tempId,
      task: '',
      status: 'Not Started',
      completed: false,
      priority: 'None',
      duration: '',
      is_persistent: false,
      isOptimistic: true,
      created_at: new Date().toISOString(),
      last_reset_at: new Date().toISOString(),
    };

    setTasks((prev) => [...prev, optimisticTask]);

    requestAnimationFrame(() => {
      const el = document.querySelector(
        `[data-task-id="${tempId}"] input`,
      ) as HTMLInputElement | null;
      el?.focus({ preventScroll: true });
    });

    if (!isLoggedIn || !user) return;

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
          is_persistent: false,
        },
      ])
      .select();

    if (error || !data) {
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      return;
    }

    const realTask = data[0];
    setTasks((prev) =>
      prev.map((t) => (t.id === tempId ? { ...realTask } : t)),
    );
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

    if (
      isLoggedIn &&
      taskToUpdate.id &&
      !taskToUpdate.id.startsWith('temp-')
    ) {
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

  const togglePersistent = async (index: number) => {
    const task = tasks[index];
    const newValue = !task.is_persistent;

    setTasks((prev) =>
      prev.map((t, i) =>
        i === index ? { ...t, is_persistent: newValue } : t,
      ),
    );

    if (isLoggedIn && task.id && !task.id.startsWith('temp-')) {
      await supabase
        .from('quests')
        .update({ is_persistent: newValue })
        .eq('id', task.id);
    }
  };

  const removeTask = async (index: number) => {
    const taskToDelete = tasks[index];
    setTasks((prev) => prev.filter((_, i) => i !== index));

    if (
      isLoggedIn &&
      taskToDelete.id &&
      !taskToDelete.id.startsWith('temp-')
    ) {
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

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className='min-h-screen bg-soft text-foreground font-luckiest overflow-x-hidden'>
      <CommandMenu />

      {/* TOP NAV */}
      <div className='flex items-center justify-between px-4 sm:px-6 md:px-10 pt-4 sm:pt-6 md:pt-8'>
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

        <Link href='/'>
          <motion.div
            whileHover={{ scale: 1.04, x: 3, y: 3, boxShadow: 'none' }}
            whileTap={{ scale: 0.96 }}
            className='flex items-center gap-1.5 sm:gap-2 bg-white border-4 border-black px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer group'
          >
            <HomeIcon
              size={18}
              className='group-hover:-translate-y-0.5 transition-transform flex-shrink-0'
            />
            <span className='text-xs sm:text-sm md:text-base uppercase tracking-tight'>
              Home
            </span>
          </motion.div>
        </Link>
      </div>

      {/* HERO */}
      <div className='text-center px-4 sm:px-6 pt-6 sm:pt-8 pb-5 sm:pb-7'>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-3xl sm:text-4xl md:text-5xl font-oi tracking-wide uppercase mb-3'
        >
          QuestBoard
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className='flex items-center justify-center gap-2 text-light-bronze text-sm sm:text-base md:text-lg flex-wrap'
        >
          <span className='flex items-center gap-1.5'>
            <CalendarDaysIcon size={16} /> {date}
          </span>
          {yesterdayCount > 0 && (
            <span className='flex items-center gap-1.5 opacity-60 text-xs sm:text-sm'>
              <span className='opacity-30'>·</span>
              <CheckCheckIcon size={13} />
              {yesterdayCount} done yesterday
            </span>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='text-[11px] sm:text-xs text-light-bronze/60 uppercase tracking-widest mt-4'
        >
          Daily tasks reset at midnight · Pinned tasks stay forever
        </motion.p>
      </div>

      {/* PROGRESS BAR */}
      <AnimatePresence>
        {isLoggedIn && hasLoaded && totalCount > 0 && (
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
                  width: `${
                    totalCount > 0
                      ? (completedCount / totalCount) * 100
                      : 0
                  }%`,
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className='border-4 border-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white'
        >
          {/* ── DESKTOP TABLE ── */}
          <div className='hidden md:block'>
            <div className='grid grid-cols-[2fr_0.8fr_0.8fr_1fr_0.5fr_0.5fr_0.5fr] bg-white border-b-4 border-black'>
              {['Quest', 'Priority', 'Duration', 'Status', 'Pin', 'Done', ''].map(
                (h, i) => (
                  <div
                    key={i}
                    className={`px-4 py-3 text-xs md:text-sm uppercase opacity-50 tracking-widest ${
                      i > 0 ? 'text-center border-l-2 border-black/10' : 'pl-5'
                    }`}
                  >
                    {h}
                  </div>
                ),
              )}
            </div>

            <AnimatePresence mode='popLayout' initial={false}>
              {hasLoaded && tasks.length === 0 && (
                <motion.div
                  key='empty-desktop'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className='py-16 text-center'
                >
                  <div className='text-4xl mb-3'>⚔️</div>
                  <p className='uppercase opacity-30 text-sm tracking-widest'>
                    No quests yet
                  </p>
                  <p className='uppercase opacity-20 text-xs mt-1'>
                    Add one below to begin
                  </p>
                </motion.div>
              )}

              {tasks.map((item, i) => (
                <motion.div
                  key={item.id || `local-${i}`}
                  data-task-id={item.id}
                  initial={
                    item.isOptimistic
                      ? { opacity: 0, scaleY: 0.92, y: 12 }
                      : false
                  }
                  animate={{ opacity: 1, scaleY: 1, y: 0 }}
                  exit={{ opacity: 0, scaleY: 0.92, y: -8 }}
                  transition={{
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                    opacity: { duration: 0.35, ease: 'easeOut' },
                    y: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                    scaleY: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                  }}
                  style={{ originY: 0, willChange: 'transform, opacity' }}
                  className={`grid grid-cols-[2fr_0.8fr_0.8fr_1fr_0.5fr_0.5fr_0.5fr] border-b border-black/10 last:border-0 items-stretch ${getStatusColor(
                    item.status,
                  )}`}
                >
                  <input
                    className={`px-5 py-4 bg-transparent outline-none text-sm md:text-base placeholder:opacity-25 font-luckiest ${
                      item.completed ? 'line-through opacity-40' : ''
                    }`}
                    value={item.task}
                    onChange={(e) => updateTask(i, 'task', e.target.value)}
                    placeholder='Add a mission...'
                  />
                  <div
                    className={`relative border-l-2 border-black/10 ${getPriorityColor(
                      item.priority,
                    )}`}
                  >
                    <select
                      className='w-full h-full px-2 py-4 bg-transparent outline-none cursor-pointer appearance-none text-center text-xs font-luckiest'
                      value={item.priority}
                      onChange={(e) =>
                        updateTask(i, 'priority', e.target.value)
                      }
                    >
                      <option value='None'>—</option>
                      <option value='Low'>Low</option>
                      <option value='Mid'>Mid</option>
                      <option value='High'>High</option>
                    </select>
                    <ChevronDownIcon
                      size={10}
                      className='absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40'
                    />
                  </div>
                  <input
                    className='px-3 py-4 bg-transparent outline-none border-l-2 border-black/10 text-center text-xs placeholder:opacity-25 font-luckiest'
                    value={item.duration}
                    onChange={(e) =>
                      updateTask(i, 'duration', e.target.value)
                    }
                    placeholder='30m'
                  />
                  <div className='relative border-l-2 border-black/10'>
                    <select
                      className='w-full h-full px-2 py-4 bg-transparent outline-none cursor-pointer appearance-none text-center text-xs font-luckiest'
                      value={item.status}
                      onChange={(e) =>
                        updateTask(i, 'status', e.target.value)
                      }
                    >
                      <option value='Not Started'>Not Started</option>
                      <option value='In Progress'>In Progress</option>
                      <option value='Done'>Done</option>
                    </select>
                    <ChevronDownIcon
                      size={10}
                      className='absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40'
                    />
                  </div>

                  <div
                    onClick={() => togglePersistent(i)}
                    className='flex justify-center items-center border-l-2 border-black/10 cursor-pointer hover:bg-yellow-50 transition-colors group'
                    title={
                      item.is_persistent
                        ? 'Pinned — will NOT auto-reset'
                        : 'Click to pin — prevents daily reset'
                    }
                  >
                    <motion.div whileTap={{ scale: 0.85 }}>
                      {item.is_persistent ? (
                        <Pin
                          size={16}
                          className='text-amber-600 fill-amber-400'
                        />
                      ) : (
                        <PinOff
                          size={16}
                          className='text-black/20 group-hover:text-amber-500 transition-colors'
                        />
                      )}
                    </motion.div>
                  </div>

                  <div
                    className='flex justify-center items-center border-l-2 border-black/10 cursor-pointer'
                    onClick={() =>
                      updateTask(i, 'completed', !item.completed)
                    }
                  >
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      className={`w-7 h-7 rounded-lg border-2 border-black flex items-center justify-center transition-all ${
                        item.completed
                          ? 'bg-primary shadow-[2px_2px_0px_black]'
                          : 'bg-white'
                      }`}
                    >
                      {item.completed && (
                        <CheckIcon size={16} className='text-white' />
                      )}
                    </motion.div>
                  </div>
                  <div
                    onClick={() => removeTask(i)}
                    className='flex justify-center items-center border-l-2 border-black/10 cursor-pointer hover:bg-red-50 transition-colors group'
                  >
                    <DeleteIcon
                      size={18}
                      className='text-black/20 group-hover:text-red-400 transition-colors'
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── MOBILE CARDS ── */}
          <div className='block md:hidden'>
            <AnimatePresence mode='popLayout' initial={false}>
              {hasLoaded && tasks.length === 0 && (
                <motion.div
                  key='empty-mobile'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className='py-14 text-center'
                >
                  <div className='text-4xl mb-3'>⚔️</div>
                  <p className='uppercase opacity-30 text-sm tracking-widest'>
                    No quests yet
                  </p>
                  <p className='uppercase opacity-20 text-xs mt-1'>
                    Add one below to begin
                  </p>
                </motion.div>
              )}

              {tasks.map((item, i) => (
                <motion.div
                  key={item.id || `local-${i}`}
                  data-task-id={item.id}
                  initial={
                    item.isOptimistic
                      ? { opacity: 0, scaleY: 0.94, y: 12 }
                      : false
                  }
                  animate={{ opacity: 1, scaleY: 1, y: 0 }}
                  exit={{ opacity: 0, scaleY: 0.94, y: -8 }}
                  transition={{
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                    opacity: { duration: 0.35, ease: 'easeOut' },
                    y: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                    scaleY: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                  }}
                  style={{ originY: 0, willChange: 'transform, opacity' }}
                  className={`border-b border-black/10 last:border-0 p-3 ${getStatusColor(
                    item.status,
                  )}`}
                >
                  <div className='flex items-center gap-2 mb-2'>
                    <input
                      className={`flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:opacity-25 font-luckiest ${
                        item.completed ? 'line-through opacity-40' : ''
                      }`}
                      value={item.task}
                      onChange={(e) => updateTask(i, 'task', e.target.value)}
                      placeholder='Add a mission...'
                    />
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => togglePersistent(i)}
                      className='w-7 h-7 flex items-center justify-center flex-shrink-0'
                      title={
                        item.is_persistent
                          ? 'Pinned — will NOT auto-reset'
                          : 'Click to pin'
                      }
                    >
                      {item.is_persistent ? (
                        <Pin
                          size={14}
                          className='text-amber-600 fill-amber-400'
                        />
                      ) : (
                        <PinOff size={14} className='text-black/20' />
                      )}
                    </motion.button>
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      onClick={() =>
                        updateTask(i, 'completed', !item.completed)
                      }
                      className={`w-7 h-7 rounded-lg border-2 border-black flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${
                        item.completed
                          ? 'bg-primary shadow-[2px_2px_0px_black]'
                          : 'bg-white'
                      }`}
                    >
                      {item.completed && (
                        <CheckIcon size={14} className='text-white' />
                      )}
                    </motion.div>
                    <div
                      onClick={() => removeTask(i)}
                      className='w-7 h-7 flex items-center justify-center flex-shrink-0 cursor-pointer group'
                    >
                      <DeleteIcon
                        size={16}
                        className='text-black/20 group-hover:text-red-400 transition-colors'
                      />
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <div
                      className={`relative flex-1 rounded-lg border-2 border-black/15 ${getPriorityColor(
                        item.priority,
                      )}`}
                    >
                      <select
                        className='w-full px-2 py-1.5 bg-transparent outline-none cursor-pointer appearance-none text-center text-[10px] font-luckiest'
                        value={item.priority}
                        onChange={(e) =>
                          updateTask(i, 'priority', e.target.value)
                        }
                      >
                        <option value='None'>Priority</option>
                        <option value='Low'>Low</option>
                        <option value='Mid'>Mid</option>
                        <option value='High'>High</option>
                      </select>
                      <ChevronDownIcon
                        size={8}
                        className='absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-40'
                      />
                    </div>
                    <input
                      className='flex-1 px-2 py-1.5 bg-white/60 border-2 border-black/15 rounded-lg outline-none text-center text-[10px] placeholder:opacity-30 font-luckiest'
                      value={item.duration}
                      onChange={(e) =>
                        updateTask(i, 'duration', e.target.value)
                      }
                      placeholder='Duration'
                    />
                    <div className='relative flex-1 rounded-lg border-2 border-black/15 bg-white/60'>
                      <select
                        className='w-full px-2 py-1.5 bg-transparent outline-none cursor-pointer appearance-none text-center text-[10px] font-luckiest'
                        value={item.status}
                        onChange={(e) =>
                          updateTask(i, 'status', e.target.value)
                        }
                      >
                        <option value='Not Started'>Not Started</option>
                        <option value='In Progress'>In Progress</option>
                        <option value='Done'>Done</option>
                      </select>
                      <ChevronDownIcon
                        size={8}
                        className='absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-40'
                      />
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
            <span className='text-xs sm:text-sm uppercase tracking-widest'>
              Add quest
            </span>
          </motion.button>
        </motion.div>
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
                <span className='text-sm sm:text-base uppercase'>
                  Dashboard
                </span>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Page;