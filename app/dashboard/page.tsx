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
  LockIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createBrowserClient } from '@supabase/ssr';

// ── Types ──────────────────────────────────────────────────────────────────────
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

// ── Premium Lock Overlay ───────────────────────────────────────────────────────
const PremiumLock = ({ label = 'Premium Feature' }: { label?: string }) => (
  <div className='absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl gap-3'>
    <div className='bg-[#d4a373] border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
      <LockIcon size={28} />
    </div>
    <p className='text-white font-luckiest uppercase text-sm'>{label}</p>
    <Link href='/premium'>
      <motion.div
        whileHover={{ scale: 1.04, x: 2, y: 2, boxShadow: 'none' }}
        whileTap={{ scale: 0.96 }}
        className='bg-[#d4a373] border-4 border-black px-5 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs uppercase font-luckiest cursor-pointer'
      >
        Unlock Premium
      </motion.div>
    </Link>
  </div>
);

// ── Tooltip ────────────────────────────────────────────────────────────────────
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
              text: 'PDF Mission Debrief Export',
            },
            {
              icon: <BarChart2Icon size={18} />,
              text: 'Advanced Visual Analytics',
            },
            {
              icon: <ShieldCheckIcon size={18} />,
              text: 'Full Streak History',
            },
            { icon: <StarIcon size={18} />, text: 'Commander Badge + 1.5x XP' },
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

// ── Sparkline chart (mini line) ────────────────────────────────────────────────
const SparkLine = ({
  data,
  color = '#d4a373',
}: {
  data: number[];
  color?: string;
}) => {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 200;
  const h = 60;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`)
    .join(' ');
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className='w-full h-14'
      preserveAspectRatio='none'
    >
      <polyline
        points={points}
        fill='none'
        stroke={color}
        strokeWidth='3'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <polyline
        points={`0,${h} ${points} ${w},${h}`}
        fill={color}
        fillOpacity='0.15'
        stroke='none'
      />
    </svg>
  );
};

// ── Donut chart ────────────────────────────────────────────────────────────────
const DonutChart = ({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  const r = 40;
  const circ = 2 * Math.PI * r;
  return (
    <div className='flex items-center gap-4'>
      <svg viewBox='0 0 100 100' className='w-24 h-24 flex-shrink-0 -rotate-90'>
        <circle
          cx='50'
          cy='50'
          r={r}
          fill='none'
          stroke='#e9edc9'
          strokeWidth='16'
        />
        {data.map((d, i) => {
          const dash = (d.value / total) * circ;
          const el = (
            <circle
              key={i}
              cx='50'
              cy='50'
              r={r}
              fill='none'
              stroke={d.color}
              strokeWidth='16'
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap='butt'
            />
          );
          offset += dash;
          return el;
        })}
        <circle cx='50' cy='50' r='28' fill='white' />
      </svg>
      <div className='space-y-1.5'>
        {data.map((d, i) => (
          <div key={i} className='flex items-center gap-2 text-xs uppercase'>
            <div
              className='w-3 h-3 rounded-sm border border-black/20'
              style={{ backgroundColor: d.color }}
            />
            <span className='opacity-60'>{d.label}</span>
            <span className='font-bold ml-auto'>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

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
  const isPremium = user?.isPremium ?? false;

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
  const [weeklyTrend, setWeeklyTrend] = useState<number[]>([]);
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
    bestDay: '',
    bestDayRate: 0,
    avgCompletion: 0,
    mostProductiveWeekday: '',
    highPriorityRate: 0,
    totalLifetime: 0,
    completedLifetime: 0,
    weekdayRates: [] as number[],
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
      const todayQ = quests.filter(
        (q) => new Date(q.created_at).toLocaleDateString() === todayStr,
      );

      const priorities = { High: 0, Mid: 0, Low: 0, None: 0 };
      quests.forEach((q) => {
        const p = q.priority as keyof typeof priorities;
        if (p in priorities) priorities[p]++;
      });
      setPriorityData(priorities);

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

      // Weekly trend (last 14 days completion percent)
      const trend = [...Array(14)].map((_, i) => {
        const d = history[history.length - (14 - i)];
        return d ? d.percent : 0;
      });
      setWeeklyTrend(trend);

      // Streak calc
      const sortedDates = Object.keys(byDate).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );
      let maxS = 0,
        tempStreak = 0,
        tempStart = '';
      const allStreaks: { start: string; end: string; length: number }[] = [];
      for (let i = 0; i < sortedDates.length; i++) {
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

      const descDates = Object.keys(byDate).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime(),
      );
      let currentStreak = 0;
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
      // XP multiplier: 1.5x for premium
      const xpPerQuest = isPremium ? 150 : 100;
      const xp = lifetimeCompleted * xpPerQuest;

      setStats({
        total: todayQ.length,
        completed: todayQ.filter((q) => q.completed).length,
        rate:
          todayQ.length > 0
            ? Math.round(
                (todayQ.filter((q) => q.completed).length / todayQ.length) *
                  100,
              )
            : 0,
        streak: currentStreak,
        xp,
      });

      // Advanced analytics
      const bestDayEntry = Object.entries(byDate).sort((a, b) => {
        const pA = a[1].total > 0 ? a[1].completed / a[1].total : 0;
        const pB = b[1].total > 0 ? b[1].completed / b[1].total : 0;
        return pB - pA;
      })[0];

      const weekdayTotals: number[] = Array(7).fill(0);
      const weekdayCompleted: number[] = Array(7).fill(0);
      Object.entries(byDate).forEach(([, data]) => {
        weekdayTotals[data.weekday] += data.total;
        weekdayCompleted[data.weekday] += data.completed;
      });
      const weekdayRates = weekdayTotals.map((t, i) =>
        t > 0 ? Math.round((weekdayCompleted[i] / t) * 100) : 0,
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

      const highQ = quests.filter((q) => q.priority === 'High');
      const highRate =
        highQ.length > 0
          ? Math.round(
              (highQ.filter((q) => q.completed).length / highQ.length) * 100,
            )
          : 0;
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
        weekdayRates,
      });
    };
    fetchData();
  }, [user, supabase, isPremium]);

  const getBarColor = (d: DayData | undefined) => {
    if (!d) return '#e9edc9';
    if (d.isToday) return '#d4a373';
    return d.percent > 70 ? '#ccd5ae' : '#C8C3C1';
  };

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

  const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div
      initial='initial'
      animate='animate'
      variants={containerVars}
      className='p-6 md:p-10 min-h-screen bg-[#e9edc9] text-black font-luckiest'
    >
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
            className={`p-3 px-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 uppercase text-sm ${isPremium ? 'bg-[#d4a373]' : 'bg-white'}`}
          >
            {isPremium && (
              <StarIcon size={16} className='fill-current text-white' />
            )}
            <span className={isPremium ? 'text-white' : 'text-[#d4a373]'}>
              {user?.codename ?? 'COMMANDER'}
            </span>
            <span className='opacity-30'>|</span>
            <span className='opacity-80'>
              LVL {levelInfo.level} {levelInfo.name}
            </span>
            <span className='opacity-30'>|</span>
            <span
              className={`px-2 py-0.5 border-2 border-black rounded-lg text-xs ${isPremium ? 'bg-white' : 'bg-[#fefae0]'}`}
            >
              {stats.xp} XP{' '}
              {isPremium && <span className='text-[#d4a373]'>×1.5</span>}
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
          className={`md:col-span-2 p-8 rounded-3xl border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden ${isPremium ? 'bg-[#d4a373]' : 'bg-[#d4a373]'}`}
        >
          {isPremium && (
            <div className='absolute top-4 right-4 flex items-center gap-1 bg-white/20 border border-white/40 px-2 py-1 rounded-full'>
              <StarIcon size={12} className='fill-white text-white' />
              <span className='text-white text-[10px] uppercase'>
                Commander
              </span>
            </div>
          )}
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
          {/* Mini sparkline */}
          {weeklyTrend.length > 1 && (
            <div className='mt-4 opacity-60'>
              <SparkLine data={weeklyTrend} color='white' />
            </div>
          )}
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

          {/* STREAK CARD */}
          <motion.div
            variants={itemVars}
            whileHover={{ scale: 1.04, x: -4 }}
            style={{ backgroundColor: '#f07167' }}
            className='p-5 rounded-2xl border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between cursor-pointer'
            onClick={() => isPremium && setShowStreakHistory((s) => !s)}
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
                    <span className='text-[#d4a373]'>
                      {isPremium ? maxStreak : '??'}d
                    </span>
                  </p>
                  {!isPremium && (
                    <p className='text-[10px] text-yellow-600 uppercase'>
                      Premium to see history
                    </p>
                  )}
                  {isPremium && (
                    <p className='text-[10px] opacity-40 uppercase'>
                      Click for history
                    </p>
                  )}
                </div>,
              )
            }
            onMouseLeave={hideTooltip}
          >
            <div>
              <p className='text-xs opacity-70'>STREAK</p>
              <p className='text-4xl'>{stats.streak} DAYS</p>
              <p className='text-[10px] opacity-60 uppercase mt-0.5'>
                Best: {isPremium ? `${maxStreak}d` : '? Premium'} ↑
              </p>
            </div>
            <Image
              src='/Fire.gif'
              alt='fire'
              width={40}
              height={40}
              unoptimized
              className={stats.streak === 0 ? 'grayscale opacity-40' : ''}
            />
          </motion.div>
        </div>

        {/* STREAK HISTORY — Premium only */}
        <AnimatePresence>
          {showStreakHistory && isPremium && (
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
                      Top 5 streaks
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
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl uppercase flex items-center gap-2'>
              <ZapIcon size={22} /> Commander Rank
            </h2>
            {isPremium && (
              <div className='flex items-center gap-1 bg-[#d4a373] border-2 border-black px-3 py-1 rounded-full text-xs uppercase'>
                <StarIcon size={12} className='fill-current' /> 1.5× XP Active
              </div>
            )}
          </div>
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
              className={`h-full rounded-lg ${isPremium ? 'bg-gradient-to-r from-[#d4a373] to-[#f07167]' : 'bg-[#d4a373]'}`}
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

        {/* PRIORITY LOADOUT — with donut chart for premium */}
        <motion.div
          variants={itemVars}
          className='md:col-span-1 bg-white p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
        >
          <h2 className='text-xl mb-5 uppercase flex items-center gap-2'>
            <PieChartIcon size={20} /> Priority Loadout
          </h2>
          {isPremium ? (
            <DonutChart
              data={[
                { label: 'High', value: priorityData.High, color: '#ffadad' },
                { label: 'Mid', value: priorityData.Mid, color: '#ffd6a5' },
                { label: 'Low', value: priorityData.Low, color: '#ccd5ae' },
                { label: 'None', value: priorityData.None, color: '#e9edc9' },
              ]}
            />
          ) : (
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
                        <p className='text-xs opacity-50'>{val} quests</p>
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
                      transition={{ duration: 1 }}
                      className={`h-full ${key === 'High' ? 'bg-[#ffadad]' : key === 'Mid' ? 'bg-[#ffd6a5]' : key === 'Low' ? 'bg-[#caffbf]' : 'bg-gray-300'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* WEEKLY PERFORMANCE */}
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
                  className='flex-1 h-full flex flex-col justify-end items-center gap-1.5'
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: `${Math.max(barHeight, dayData ? 8 : 0)}%`,
                    }}
                    transition={{ delay: i * 0.05, type: 'spring' }}
                    style={{
                      height: `${Math.max(barHeight, dayData ? 8 : 0)}%`,
                      backgroundColor: getBarColor(dayData),
                    }}
                    className={`w-full border-2 border-black rounded-t-lg cursor-pointer hover:opacity-80 ${!dayData ? 'opacity-10' : ''}`}
                    onMouseEnter={(e) =>
                      dayData &&
                      showTooltip(
                        e,
                        <div className='space-y-0.5'>
                          <p className='text-xs font-bold'>{dayData.date}</p>
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
                  <span className='text-[8px] uppercase opacity-40'>
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

        {/* MONTHLY MOMENTUM — Premium gate */}
        <motion.div
          variants={itemVars}
          className='md:col-span-3 bg-white p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative'
        >
          {!isPremium && <PremiumLock label='Monthly Chart — Premium' />}
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
                  style={{
                    height: `${Math.max(barHeight, dayData ? 15 : 5)}%`,
                    backgroundColor: getBarColor(dayData),
                  }}
                  className={`flex-1 border border-black rounded-t-sm cursor-pointer hover:opacity-70 ${!dayData ? 'opacity-5' : ''}`}
                  onMouseEnter={(e) =>
                    dayData &&
                    showTooltip(
                      e,
                      <div>
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

        {/* YEARLY COMBAT RECORD — Premium gate */}
        <motion.div
          variants={itemVars}
          className='md:col-span-3 bg-white p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative'
        >
          {!isPremium && <PremiumLock label='Yearly Record — Premium' />}
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
                          <div>
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

        {/* ADVANCED ANALYTICS — Full premium gate with visual charts */}
        <motion.div
          variants={itemVars}
          className='md:col-span-3 bg-[#faedcd] border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative'
        >
          {!isPremium && <PremiumLock label='Advanced Analytics — Premium' />}
          <div className='flex items-center justify-between px-6 py-4 border-b-4 border-black bg-[#d4a373]'>
            <div className='flex items-center gap-3'>
              <BrainIcon size={22} />
              <h2 className='text-xl uppercase'>Advanced Analytics</h2>
            </div>
            {isPremium && (
              <div className='flex items-center gap-1 bg-white/30 border border-white/50 px-2 py-1 rounded-full text-xs uppercase'>
                <StarIcon size={10} className='fill-current' /> Premium
              </div>
            )}
          </div>
          <div className='p-6 space-y-6'>
            {/* Stat grid */}
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
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
                >
                  <div className='flex items-center gap-2 opacity-50 mb-2 text-xs uppercase'>
                    {item.icon} {item.label}
                  </div>
                  <p className='text-2xl md:text-3xl font-luckiest'>
                    {item.val}
                  </p>
                  {'sub' in item && item.sub && (
                    <p className='text-[10px] opacity-40 font-sans mt-0.5'>
                      {item.sub}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Weekday performance bar chart */}
            <div className='bg-white border-2 border-black rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'>
              <h3 className='text-sm uppercase mb-4 opacity-60 flex items-center gap-2'>
                <BarChart3Icon size={16} /> Completion Rate by Weekday
              </h3>
              <div className='flex items-end gap-2 h-24 border-b-2 border-black pb-1'>
                {advancedStats.weekdayRates.map((rate, i) => (
                  <div
                    key={i}
                    className='flex-1 flex flex-col items-center justify-end gap-1'
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(rate, 4)}%` }}
                      transition={{ delay: i * 0.06, type: 'spring' }}
                      className='w-full rounded-t-lg border-2 border-black cursor-pointer hover:opacity-80'
                      style={{
                        height: `${Math.max(rate, 4)}%`,
                        backgroundColor:
                          rate > 70
                            ? '#ccd5ae'
                            : rate > 40
                              ? '#d4a373'
                              : '#ffadad',
                      }}
                      onMouseEnter={(e) =>
                        showTooltip(
                          e,
                          <div>
                            <p className='text-xs font-bold'>{DAYS_SHORT[i]}</p>
                            <p className='text-sm text-[#d4a373]'>{rate}%</p>
                          </div>,
                        )
                      }
                      onMouseLeave={hideTooltip}
                    />
                    <span className='text-[9px] uppercase opacity-40'>
                      {DAYS_SHORT[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 14-day trend sparkline */}
            <div className='bg-white border-2 border-black rounded-2xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'>
              <h3 className='text-sm uppercase mb-3 opacity-60'>
                14-Day Completion Trend
              </h3>
              <SparkLine data={weeklyTrend} color='#d4a373' />
              <div className='flex justify-between text-[9px] opacity-30 uppercase mt-1'>
                <span>14 days ago</span>
                <span>Today</span>
              </div>
            </div>
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
            onClick={() => !isPremium && setShowPremium(true)}
            whileHover={{ scale: 1.1, rotate: -2 }}
            whileTap={{ scale: 0.9 }}
            className={`border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 text-lg uppercase cursor-pointer transition-colors group ${isPremium ? 'bg-[#d4a373] hover:bg-white' : 'bg-white hover:bg-[#d4a373]'}`}
          >
            <DownloadIcon size={22} /> Download PDF
            {!isPremium && (
              <StarIcon
                size={14}
                className='text-[#d4a373] group-hover:text-white'
              />
            )}
            {isPremium && (
              <StarIcon size={14} className='text-white fill-current' />
            )}
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
