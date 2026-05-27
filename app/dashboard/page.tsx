'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  TrophyIcon,
  TargetIcon,
  ZapIcon,
  CalendarIcon,
  PieChartIcon,
  DownloadIcon,
  TrendingUpIcon,
  BarChart3Icon,
  LogOutIcon,
  XIcon,
  StarIcon,
  ShieldCheckIcon,
  BarChart2Icon,
  FlameIcon,
  ClockIcon,
  BrainIcon,
  AwardIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createBrowserClient } from '@supabase/ssr';
import CommandMenu from '@/components/CommandMenu';

// ── Types ─────────────────────────────────────────────────────────────────────
type DayData = {
  date: string;
  total: number;
  completed: number;
  percent: number;
  isToday: boolean;
};
type Tooltip = { x: number; y: number; content: React.ReactNode } | null;

// ── XP System ─────────────────────────────────────────────────────────────────
const XP_LEVELS = [
  { level: 1, name: 'ROOKIE', minXP: 0 },
  { level: 2, name: 'SCOUT', minXP: 200 },
  { level: 3, name: 'SOLDIER', minXP: 500 },
  { level: 4, name: 'CORPORAL', minXP: 1000 },
  { level: 5, name: 'SERGEANT', minXP: 2000 },
  { level: 6, name: 'LIEUTENANT', minXP: 3500 },
  { level: 7, name: 'CAPTAIN', minXP: 5500 },
  { level: 8, name: 'MAJOR', minXP: 8000 },
  { level: 9, name: 'COLONEL', minXP: 11000 },
  { level: 10, name: 'COMMANDANT', minXP: 15000 },
];

const getLevel = (xp: number) => {
  let current = XP_LEVELS[0];
  for (const lvl of XP_LEVELS) {
    if (xp >= lvl.minXP) current = lvl;
  }
  const nextLvl = XP_LEVELS.find((l) => l.minXP > xp);
  const progress = nextLvl
    ? Math.round(((xp - current.minXP) / (nextLvl.minXP - current.minXP)) * 100)
    : 100;
  return { ...current, nextLvl, progress };
};

// ── Tooltip Component ──────────────────────────────────────────────────────────
const TooltipBox = ({ tooltip }: { tooltip: Tooltip }) => {
  if (!tooltip) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className='fixed z-50 bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-3 pointer-events-none font-luckiest min-w-[140px]'
      style={{ left: tooltip.x + 12, top: tooltip.y - 60 }}
    >
      {tooltip.content}
    </motion.div>
  );
};

// ── Premium Modal ──────────────────────────────────────────────────────────────
const PremiumModal = ({ onClose }: { onClose: () => void }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6'
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className='w-full max-w-md bg-white border-4 border-black rounded-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden font-luckiest'
      >
        <div className='bg-[#d4a373] p-6 relative text-black text-center border-b-4 border-black'>
          <button
            onClick={onClose}
            className='absolute top-4 right-4 bg-white/30 hover:bg-white/50 border-2 border-black rounded-xl p-1 cursor-pointer'
          >
            <XIcon size={18} />
          </button>
          <div className='flex justify-center mb-3'>
            <div className='bg-white border-4 border-black p-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
              <StarIcon size={36} className='text-[#d4a373]' />
            </div>
          </div>
          <h2 className='text-3xl uppercase tracking-wide'>Premium</h2>
          <p className='opacity-70 text-sm uppercase mt-1'>
            Unlock Commander Tier
          </p>
        </div>
        <div className='p-6 space-y-3'>
          {[
            {
              icon: <DownloadIcon size={18} />,
              text: 'Export Mission Debrief as PDF',
            },
            {
              icon: <BarChart2Icon size={18} />,
              text: 'Advanced Stats & Analytics',
            },
            { icon: <ShieldCheckIcon size={18} />, text: 'Priority Support' },
            { icon: <StarIcon size={18} />, text: 'Exclusive Commander Badge' },
          ].map((f, i) => (
            <div
              key={i}
              className='flex items-center gap-3 bg-[#fefae0] border-2 border-black p-3 rounded-xl'
            >
              <div className='text-[#d4a373]'>{f.icon}</div>
              <span className='uppercase text-sm'>{f.text}</span>
            </div>
          ))}
        </div>
        <div className='px-6 pb-6 space-y-3'>
          <Link href='/premium'>
            <motion.div
              whileHover={{ scale: 1.02, x: 4, y: 4, boxShadow: 'none' }}
              whileTap={{ scale: 0.98 }}
              className='w-full bg-[#d4a373] border-4 border-black py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase text-xl cursor-pointer text-center'
            >
              Upgrade — $4.99 / mo
            </motion.div>
          </Link>
          <button
            onClick={onClose}
            className='w-full text-center text-sm opacity-50 uppercase hover:opacity-80 cursor-pointer'
          >
            Maybe later
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ── Protected Route ────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.replace('/login');
  }, [isLoggedIn, isLoading, router]);
  if (isLoading)
    return (
      <div className='min-h-screen bg-[#e9edc9] flex items-center justify-center font-luckiest text-2xl uppercase tracking-widest'>
        Loading...
      </div>
    );
  if (!isLoggedIn) return null;
  return <>{children}</>;
};

// ── Dashboard ──────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const supabaseRef = useRef(
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ),
  );
  const supabase = supabaseRef.current;

  const [mounted, setMounted] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [tooltip, setTooltip] = useState<Tooltip>(null);
  const [priorityData, setPriorityData] = useState({
    High: 0,
    Mid: 0,
    Low: 0,
    None: 0,
  });
  const [historyData, setHistoryData] = useState<DayData[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    rate: 0,
    streak: 0,
    xp: 0,
  });
  const [maxStreak, setMaxStreak] = useState(0);
  const [streakHistory, setStreakHistory] = useState<
    { start: string; end: string; length: number }[]
  >([]);
  const [showStreakHistory, setShowStreakHistory] = useState(false);
  const [advancedStats, setAdvancedStats] = useState({
    bestDay: '' as string,
    bestDayRate: 0,
    avgCompletion: 0,
    mostProductiveWeekday: '',
    highPriorityRate: 0,
    totalLifetime: 0,
    completedLifetime: 0,
  });

  const levelInfo = getLevel(stats.xp);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      const { data: quests } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (!quests) return;

      const todayStr = new Date().toLocaleDateString();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Today stats
      const todayQ = quests.filter(
        (q) => new Date(q.created_at).toLocaleDateString() === todayStr,
      );
      const totalToday = todayQ.length;
      const completedToday = todayQ.filter((q) => q.completed).length;

      // Priority breakdown
      const priorities = { High: 0, Mid: 0, Low: 0, None: 0 };
      quests.forEach((q) => {
        const p = q.priority as keyof typeof priorities;
        if (p in priorities) priorities[p]++;
      });
      setPriorityData(priorities);

      // Group by date
      const byDate: Record<
        string,
        { total: number; completed: number; weekday: number }
      > = {};
      quests.forEach((q) => {
        const d = new Date(q.created_at);
        const key = d.toLocaleDateString();
        if (!byDate[key])
          byDate[key] = { total: 0, completed: 0, weekday: d.getDay() };
        byDate[key].total++;
        if (q.completed) byDate[key].completed++;
      });

      const history: DayData[] = Object.entries(byDate).map(([date, data]) => ({
        date,
        total: data.total,
        completed: data.completed,
        percent: data.total > 0 ? (data.completed / data.total) * 100 : 0,
        isToday: date === todayStr,
      }));
      setHistoryData(history);

      // ── Streak calculation with HISTORY ────────────────────────────────────
      const sortedDates = Object.keys(byDate).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );
      let currentStreak = 0;
      let maxS = 0;
      let tempStreak = 0;
      let tempStart = '';
      const allStreaks: { start: string; end: string; length: number }[] = [];

      for (let i = 0; i < sortedDates.length; i++) {
        const d = new Date(sortedDates[i]);
        d.setHours(0, 0, 0, 0);
        const hasCompleted = byDate[sortedDates[i]].completed > 0;

        if (hasCompleted) {
          if (tempStreak === 0) tempStart = sortedDates[i];
          tempStreak++;
          if (tempStreak > maxS) maxS = tempStreak;
        } else {
          if (tempStreak > 0) {
            allStreaks.push({
              start: tempStart,
              end: sortedDates[i - 1],
              length: tempStreak,
            });
            tempStreak = 0;
          }
        }
      }
      if (tempStreak > 0)
        allStreaks.push({
          start: tempStart,
          end: sortedDates[sortedDates.length - 1],
          length: tempStreak,
        });

      // Current streak (from today backwards)
      const descDates = Object.keys(byDate).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime(),
      );
      for (let i = 0; i < descDates.length; i++) {
        const d = new Date(descDates[i]);
        d.setHours(0, 0, 0, 0);
        const diffDays = Math.round(
          (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays === i && byDate[descDates[i]].completed > 0)
          currentStreak++;
        else break;
      }

      setMaxStreak(maxS);
      setStreakHistory(
        allStreaks.sort((a, b) => b.length - a.length).slice(0, 5),
      );

      const lifetimeCompleted = quests.filter((q) => q.completed).length;
      const xp = lifetimeCompleted * 100;

      setStats({
        total: totalToday,
        completed: completedToday,
        rate:
          totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0,
        streak: currentStreak,
        xp,
      });

      // ── Advanced Analytics ───────────────────────────────────────────────
      // Best day ever
      const bestDayEntry = Object.entries(byDate).sort((a, b) => {
        const pA = a[1].total > 0 ? a[1].completed / a[1].total : 0;
        const pB = b[1].total > 0 ? b[1].completed / b[1].total : 0;
        return pB - pA;
      })[0];

      // Most productive weekday
      const weekdayTotals: number[] = Array(7).fill(0);
      const weekdayCompleted: number[] = Array(7).fill(0);
      Object.entries(byDate).forEach(([, data]) => {
        weekdayTotals[data.weekday] += data.total;
        weekdayCompleted[data.weekday] += data.completed;
      });
      const weekdayRates = weekdayTotals.map((t, i) =>
        t > 0 ? weekdayCompleted[i] / t : 0,
      );
      const bestWD = weekdayRates.indexOf(Math.max(...weekdayRates));
      const DAYS = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];

      // High priority completion rate
      const highQ = quests.filter((q) => q.priority === 'High');
      const highRate =
        highQ.length > 0
          ? Math.round(
              (highQ.filter((q) => q.completed).length / highQ.length) * 100,
            )
          : 0;

      // Average daily completion
      const daysWithData = Object.values(byDate).filter((d) => d.total > 0);
      const avgCompletion =
        daysWithData.length > 0
          ? Math.round(
              daysWithData.reduce(
                (acc, d) => acc + (d.completed / d.total) * 100,
                0,
              ) / daysWithData.length,
            )
          : 0;

      setAdvancedStats({
        bestDay: bestDayEntry ? bestDayEntry[0] : '—',
        bestDayRate: bestDayEntry
          ? Math.round(
              (bestDayEntry[1].completed / bestDayEntry[1].total) * 100,
            )
          : 0,
        avgCompletion,
        mostProductiveWeekday: DAYS[bestWD] || '—',
        highPriorityRate: highRate,
        totalLifetime: quests.length,
        completedLifetime: lifetimeCompleted,
      });
    };

    fetchData();
  }, [user, supabase]);

  const getBarColor = (dayData: DayData | undefined) => {
    if (!dayData) return '#e9edc9';
    if (dayData.isToday) return '#d4a373';
    return dayData.percent > 70 ? '#ccd5ae' : '#C8C3C1';
  };

  const getBarStyle = (
    dayData: DayData | undefined,
    barHeight: number,
    type: 'weekly' | 'monthly',
  ) => ({
    height: `${Math.max(barHeight, dayData ? (type === 'weekly' ? 8 : 12) : 0)}%`,
    backgroundColor: getBarColor(dayData),
  });

  const showTooltip = useCallback(
    (e: React.MouseEvent, content: React.ReactNode) => {
      setTooltip({ x: e.clientX, y: e.clientY, content });
    },
    [],
  );

  const hideTooltip = useCallback(() => setTooltip(null), []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const containerVars = { animate: { transition: { staggerChildren: 0.05 } } };
  const itemVars = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  if (!mounted) return <div className='min-h-screen bg-[#e9edc9]' />;

  return (
    <motion.div
      initial='initial'
      animate='animate'
      variants={containerVars}
      className='p-6 md:p-10 min-h-screen bg-[#f7ede2] text-black font-luckiest'
    >
      <CommandMenu />
      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}
      <AnimatePresence>
        <TooltipBox tooltip={tooltip} />
      </AnimatePresence>

      {/* HEADER */}
      <div className='max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-6'>
        <Link href='/board'>
          <motion.div
            whileHover={{ scale: 1.05, x: 5, y: 5, boxShadow: 'none' }}
            whileTap={{ scale: 0.95 }}
            className='flex items-center gap-2 bg-white border-4 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer'
          >
            <ArrowLeftIcon size={24} /> <span>Back to Board</span>
          </motion.div>
        </Link>

        <motion.h1
          variants={itemVars}
          className='text-3xl md:text-6xl font-oi tracking-wide text-center'
        >
          STAT CENTER
        </motion.h1>

        <div className='flex items-center gap-3'>
          <motion.div
            variants={itemVars}
            className='bg-white p-3 px-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 uppercase text-sm'
          >
            <span className='text-[#d4a373]'>
              {user?.codename ?? 'COMMANDER'}
            </span>
            <span className='opacity-30'>|</span>
            <span className='opacity-60'>
              LVL {levelInfo.level} {levelInfo.name}
            </span>
            <span className='opacity-30'>|</span>
            <span className='bg-[#fefae0] px-2 py-0.5 border-2 border-black rounded-lg text-xs'>
              {stats.xp} XP
            </span>
          </motion.div>
          <motion.button
            variants={itemVars}
            whileHover={{ scale: 1.05, x: 2, y: 2, boxShadow: 'none' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className='flex items-center gap-2 bg-[#ffadad] hover:bg-red-400 border-4 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase cursor-pointer transition-colors'
          >
            <LogOutIcon size={20} />
            <span className='hidden md:inline text-sm'>Log Out</span>
          </motion.button>
        </div>
      </div>

      <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* SUCCESS RATE */}
        <motion.div
          variants={itemVars}
          whileHover={{ scale: 1.01 }}
          className='md:col-span-2 bg-[#d4a373] p-8 rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden'
        >
          <ZapIcon
            className='absolute right-[-20px] top-[-20px] opacity-20 rotate-12'
            size={200}
          />
          <h2 className='text-3xl mb-4 uppercase'>Today's Success Rate</h2>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className='text-8xl md:text-9xl mb-4 font-oi'
          >
            {stats.rate}%
          </motion.div>
          <p className='text-xl opacity-80 uppercase flex items-center gap-2'>
            <TrendingUpIcon /> Status:{' '}
            {stats.rate > 80
              ? 'Elite'
              : stats.rate > 50
                ? 'Optimal'
                : 'Standard'}
          </p>
        </motion.div>

        {/* STAT CARDS */}
        <div className='flex flex-col gap-4'>
          {[
            {
              label: 'COMPLETED',
              val: stats.completed,
              color: '#ccd5ae',
              icon: <TrophyIcon size={36} />,
            },
            {
              label: 'TOTAL TODAY',
              val: stats.total,
              color: '#faedcd',
              icon: <TargetIcon size={36} />,
            },
          ].map((item) => (
            <motion.div
              key={item.label}
              variants={itemVars}
              whileHover={{ scale: 1.04, x: -4 }}
              style={{ backgroundColor: item.color }}
              className='p-5 rounded-2xl border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between'
            >
              <div>
                <p className='text-xs opacity-60'>{item.label}</p>
                <p className='text-4xl'>{item.val}</p>
              </div>
              {item.icon}
            </motion.div>
          ))}

          {/* STREAK CARD — with hover history */}
          <motion.div
            variants={itemVars}
            whileHover={{ scale: 1.04, x: -4 }}
            style={{ backgroundColor: '#f07167' }}
            className='p-5 rounded-2xl border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between cursor-pointer relative'
            onClick={() => setShowStreakHistory((s) => !s)}
            onMouseEnter={(e) =>
              showTooltip(
                e,
                <div className='space-y-1'>
                  <p className='text-xs uppercase opacity-50'>Streak info</p>
                  <p className='text-sm'>
                    Current:{' '}
                    <span className='text-[#d4a373]'>{stats.streak}d</span>
                  </p>
                  <p className='text-sm'>
                    Best ever:{' '}
                    <span className='text-[#d4a373]'>{maxStreak}d</span>
                  </p>
                  <p className='text-[10px] opacity-40 uppercase mt-1'>
                    Click for history
                  </p>
                </div>,
              )
            }
            onMouseLeave={hideTooltip}
          >
            <div>
              <p className='text-xs opacity-70'>STREAK</p>
              <p className='text-4xl'>{stats.streak} DAYS</p>
              <p className='text-[10px] opacity-60 uppercase mt-0.5'>
                Best: {maxStreak}d ↑
              </p>
            </div>
            <Image
              src='/Fire.gif'
              alt='fire'
              width={40}
              height={40}
              unoptimized
              className={stats.streak === 0 ? ' opacity-100' : ''}
            />
          </motion.div>
        </div>

        {/* STREAK HISTORY PANEL */}
        <AnimatePresence>
          {showStreakHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='md:col-span-3 bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden'
            >
              <div className='flex items-center justify-between px-6 py-4 border-b-2 border-black bg-[#faedcd]'>
                <h3 className='text-lg uppercase flex items-center gap-2'>
                  <FlameIcon size={18} className='text-orange-500' /> Streak
                  History
                </h3>
                <button
                  onClick={() => setShowStreakHistory(false)}
                  className='cursor-pointer opacity-50 hover:opacity-100'
                >
                  <XIcon size={18} />
                </button>
              </div>
              <div className='p-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-[#fefae0] border-2 border-black rounded-xl p-4 text-center'>
                  <p className='text-xs uppercase opacity-50 mb-1'>
                    Current Streak
                  </p>
                  <p className='text-4xl font-oi text-[#d4a373]'>
                    {stats.streak}
                  </p>
                  <p className='text-xs uppercase opacity-40'>days</p>
                </div>
                <div className='bg-[#ccd5ae] border-2 border-black rounded-xl p-4 text-center'>
                  <p className='text-xs uppercase opacity-50 mb-1'>Best Ever</p>
                  <p className='text-4xl font-oi'>{maxStreak}</p>
                  <p className='text-xs uppercase opacity-40'>days</p>
                </div>
                <div className='bg-[#faedcd] border-2 border-black rounded-xl p-4 text-center'>
                  <p className='text-xs uppercase opacity-50 mb-1'>
                    Total Streaks
                  </p>
                  <p className='text-4xl font-oi'>{streakHistory.length}</p>
                  <p className='text-xs uppercase opacity-40'>recorded</p>
                </div>
                {streakHistory.length > 0 && (
                  <div className='md:col-span-3'>
                    <p className='text-xs uppercase opacity-40 mb-3'>
                      Top streaks
                    </p>
                    <div className='space-y-2'>
                      {streakHistory.map((s, i) => (
                        <div
                          key={i}
                          className='flex items-center gap-3 bg-[#fefae0] border-2 border-black rounded-xl p-3'
                        >
                          <div
                            className={`w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center text-sm ${i === 0 ? 'bg-[#d4a373]' : 'bg-[#e9edc9]'}`}
                          >
                            #{i + 1}
                          </div>
                          <div className='flex-1'>
                            <p className='text-sm uppercase'>
                              {s.length} day streak
                            </p>
                            <p className='text-xs opacity-40 font-sans'>
                              {s.start} → {s.end}
                            </p>
                          </div>
                          {i === 0 && (
                            <AwardIcon size={20} className='text-[#d4a373]' />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* XP LEVEL PROGRESS */}
        <motion.div
          variants={itemVars}
          className='md:col-span-3 bg-white p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
        >
          <h2 className='text-2xl mb-4 uppercase flex items-center gap-2'>
            <ZapIcon size={22} /> Commander Rank
          </h2>
          <div className='flex items-center justify-between mb-3'>
            <span className='text-xl'>
              LVL {levelInfo.level} — {levelInfo.name}
            </span>
            <span className='text-sm opacity-50'>
              {levelInfo.nextLvl
                ? `${stats.xp} / ${levelInfo.nextLvl.minXP} XP → LVL ${levelInfo.level + 1}`
                : 'MAX LEVEL'}
            </span>
          </div>
          <div className='h-8 border-4 border-black rounded-xl bg-gray-100 overflow-hidden'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className='h-full bg-[#d4a373] rounded-lg'
            />
          </div>
          <div className='flex justify-between mt-2 text-xs opacity-40 uppercase'>
            {XP_LEVELS.map((l) => (
              <span
                key={l.level}
                className={
                  l.level === levelInfo.level
                    ? 'text-[#d4a373] font-bold opacity-100'
                    : ''
                }
              >
                {l.level}
              </span>
            ))}
          </div>
        </motion.div>

        {/* PRIORITY LOADOUT */}
        <motion.div
          variants={itemVars}
          className='md:col-span-1 bg-white p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
        >
          <h2 className='text-xl mb-5 uppercase flex items-center gap-2'>
            <PieChartIcon size={20} /> Priority Loadout
          </h2>
          <div className='space-y-3'>
            {Object.entries(priorityData).map(([key, val]) => (
              <div
                key={key}
                className='flex flex-col gap-1'
                onMouseEnter={(e) =>
                  showTooltip(
                    e,
                    <div>
                      <p className='text-sm uppercase'>{key} Priority</p>
                      <p className='text-xs opacity-50'>{val} quests total</p>
                      <p className='text-xs opacity-50'>
                        {Math.round(
                          (val /
                            Math.max(
                              Object.values(priorityData).reduce(
                                (a, b) => a + b,
                                0,
                              ),
                              1,
                            )) *
                            100,
                        )}
                        % of all tasks
                      </p>
                    </div>,
                  )
                }
                onMouseLeave={hideTooltip}
              >
                <div className='flex justify-between text-xs uppercase'>
                  <span>{key}</span>
                  <span>{val}</span>
                </div>
                <div className='h-5 border-2 border-black rounded-lg bg-gray-100 overflow-hidden'>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        (val /
                          Math.max(
                            Object.values(priorityData).reduce(
                              (a, b) => a + b,
                              0,
                            ),
                            1,
                          )) *
                        100
                      }%`,
                    }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full ${key === 'High' ? 'bg-[#ffadad]' : key === 'Mid' ? 'bg-[#ffd6a5]' : key === 'Low' ? 'bg-[#caffbf]' : 'bg-gray-300'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* WEEKLY PERFORMANCE — with hover tooltips */}
        <motion.div
          variants={itemVars}
          className='md:col-span-2 bg-white p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
        >
          <h2 className='text-xl mb-6 uppercase flex items-center gap-2'>
            <BarChart3Icon size={20} /> Weekly Performance
          </h2>
          <div className='flex items-end justify-between h-36 gap-2 border-b-4 border-black pb-2'>
            {[...Array(7)].map((_, i) => {
              const dayData = historyData[historyData.length - (7 - i)];
              const barHeight = dayData ? dayData.percent : 0;
              return (
                <div
                  key={i}
                  className='flex-1 h-full flex flex-col justify-end items-center gap-1.5 group'
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: `${Math.max(barHeight, dayData ? 8 : 0)}%`,
                    }}
                    transition={{ delay: i * 0.05, type: 'spring' }}
                    style={getBarStyle(dayData, barHeight, 'weekly')}
                    className={`w-full border-2 border-black rounded-t-lg cursor-pointer transition-opacity hover:opacity-80 ${!dayData ? 'opacity-10' : ''}`}
                    onMouseEnter={(e) =>
                      dayData &&
                      showTooltip(
                        e,
                        <div className='space-y-0.5'>
                          <p className='text-xs uppercase font-bold'>
                            {dayData.date}
                          </p>
                          <p className='text-xs opacity-60'>
                            {dayData.completed}/{dayData.total} done
                          </p>
                          <p className='text-sm text-[#d4a373]'>
                            {Math.round(dayData.percent)}%
                          </p>
                          {dayData.isToday && (
                            <p className='text-[10px] opacity-40 uppercase'>
                              Today
                            </p>
                          )}
                        </div>,
                      )
                    }
                    onMouseLeave={hideTooltip}
                  />
                  <span className='text-[8px] md:text-[10px] uppercase opacity-40'>
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

        {/* MONTHLY MOMENTUM — with hover tooltips */}
        <motion.div
          variants={itemVars}
          className='md:col-span-3 bg-white p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
        >
          <h2 className='text-xl mb-5 uppercase flex items-center gap-2'>
            <CalendarIcon size={20} /> Monthly Momentum
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
                  style={getBarStyle(dayData, barHeight, 'monthly')}
                  className={`flex-1 border border-black rounded-t-sm cursor-pointer hover:opacity-70 transition-opacity ${!dayData ? 'opacity-5' : ''}`}
                  onMouseEnter={(e) =>
                    dayData &&
                    showTooltip(
                      e,
                      <div className='space-y-0.5'>
                        <p className='text-xs font-bold'>{dayData.date}</p>
                        <p className='text-xs opacity-60'>
                          {dayData.completed}/{dayData.total}
                        </p>
                        <p className='text-sm text-[#d4a373]'>
                          {Math.round(dayData.percent)}%
                        </p>
                      </div>,
                    )
                  }
                  onMouseLeave={hideTooltip}
                />
              );
            })}
          </div>
        </motion.div>

        {/* YEARLY COMBAT RECORD — with hover tooltips */}
        <motion.div
          variants={itemVars}
          className='md:col-span-3 bg-white p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
        >
          <h2 className='text-xl mb-5 uppercase'>Yearly Combat Record</h2>
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
                      whileHover={{ scale: 1.6, zIndex: 10 }}
                      className={`w-3 h-3 md:w-4 md:h-4 border border-black/20 rounded-sm cursor-pointer ${isHighSuccess ? 'bg-[#d4a373]' : hasActivity ? 'bg-[#d4a373]/40' : 'bg-gray-100'}`}
                      onMouseEnter={(e) =>
                        day &&
                        showTooltip(
                          e,
                          <div className='space-y-0.5'>
                            <p className='text-xs font-bold'>{day.date}</p>
                            <p className='text-xs opacity-60'>
                              {day.completed}/{day.total} quests
                            </p>
                            <p className='text-sm text-[#d4a373]'>
                              {Math.round(day.percent)}%
                            </p>
                          </div>,
                        )
                      }
                      onMouseLeave={hideTooltip}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <p className='mt-3 text-xs opacity-30 uppercase italic'>
            Bronze: High Success | Dim Bronze: Activity | Gray: No Data
          </p>
        </motion.div>

        {/* ── ADVANCED ANALYTICS ── */}
        <motion.div
          variants={itemVars}
          className='md:col-span-3 bg-[#faedcd] border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden'
        >
          <div className='flex items-center gap-3 px-6 py-4 border-b-4 border-black bg-[#d4a373]'>
            <BrainIcon size={22} />
            <h2 className='text-xl uppercase'>Advanced Analytics</h2>
          </div>
          <div className='p-6 grid grid-cols-2 md:grid-cols-3 gap-4'>
            {[
              {
                label: 'Avg Daily Completion',
                val: `${advancedStats.avgCompletion}%`,
                icon: <BarChart2Icon size={18} />,
                color: 'bg-white',
              },
              {
                label: 'Best Day Rate',
                val: `${advancedStats.bestDayRate}%`,
                sub: advancedStats.bestDay,
                icon: <TrophyIcon size={18} />,
                color: 'bg-[#ccd5ae]',
              },
              {
                label: 'Top Weekday',
                val: advancedStats.mostProductiveWeekday,
                icon: <CalendarIcon size={18} />,
                color: 'bg-white',
              },
              {
                label: 'High Priority Done',
                val: `${advancedStats.highPriorityRate}%`,
                icon: <TargetIcon size={18} />,
                color: 'bg-[#ffadad]/60',
              },
              {
                label: 'Lifetime Quests',
                val: advancedStats.totalLifetime,
                icon: <ClockIcon size={18} />,
                color: 'bg-white',
              },
              {
                label: 'Lifetime Completed',
                val: advancedStats.completedLifetime,
                icon: <TrophyIcon size={18} />,
                color: 'bg-[#ccd5ae]',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03, y: -2 }}
                className={`${item.color} border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}
                onMouseEnter={(e) =>
                  showTooltip(
                    e,
                    <p className='text-xs uppercase'>{item.label}</p>,
                  )
                }
                onMouseLeave={hideTooltip}
              >
                <div className='flex items-center gap-2 opacity-50 mb-2 text-xs uppercase'>
                  {item.icon} {item.label}
                </div>
                <p className='text-2xl md:text-3xl font-luckiest'>{item.val}</p>
                {'sub' in item && item.sub && (
                  <p className='text-[10px] opacity-40 font-sans mt-0.5'>
                    {item.sub}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* EXPORT */}
        <motion.div
          variants={itemVars}
          className='md:col-span-3 bg-[#ccd5ae] p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-6'
        >
          <div className='text-center md:text-left'>
            <h2 className='text-3xl uppercase mb-2'>Mission Debrief</h2>
            <p className='opacity-60 uppercase text-sm'>
              Export tactical data for offline archives.
            </p>
          </div>
          <motion.button
            onClick={() => setShowPremium(true)}
            whileHover={{ scale: 1.1, rotate: -2 }}
            whileTap={{ scale: 0.9 }}
            className='bg-white border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 text-lg uppercase cursor-pointer hover:bg-[#d4a373] transition-colors group'
          >
            <DownloadIcon size={22} /> Download PDF{' '}
            <StarIcon
              size={14}
              className='text-[#d4a373] group-hover:text-white'
            />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

const DashboardPage = () => (
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
);

export default DashboardPage;
