'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  ZapIcon,
  FlameIcon,
  BarChart3Icon,
  CompassIcon, // New icon vibe for Strategies
  StarIcon,
  ArrowRightIcon,
  CheckIcon,
  TrophyIcon,
  TargetIcon,
  UsersIcon,
  ClockIcon,
  LayoutDashboardIcon,
  UserIcon,
  LogOutIcon,
  ChevronDownIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import CommandMenu from '@/components/CommandMenu';

const Badge = ({
  children,
  bg = 'bg-[#ccd5ae]',
}: {
  children: React.ReactNode;
  bg?: string;
}) => (
  <span
    className={`inline-flex items-center gap-1.5 ${bg} text-black border-2 border-black px-3 py-1 rounded-full text-xs uppercase tracking-widest font-luckiest`}
  >
    {children}
  </span>
);

const FeatureCard = ({
  icon,
  title,
  desc,
  bg,
  iconBg,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  bg: string;
  iconBg: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -5 }}
    transition={{ type: 'spring', stiffness: 300 }}
    className={`${bg} border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3 h-full`}
  >
    <div
      className={`w-12 h-12 ${iconBg} border-2 border-black rounded-xl flex items-center justify-center flex-shrink-0`}
    >
      {icon}
    </div>
    <h3 className='text-xl font-luckiest uppercase break-words'>{title}</h3>
    <p className='text-sm font-sans opacity-60 leading-relaxed break-words'>
      {desc}
    </p>
  </motion.div>
);

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, -60]);

  // ── Real auth from context ──────────────────────────────────────────────────
  const { isLoggedIn, isLoading, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className='min-h-screen font-luckiest overflow-x-hidden bg-white text-black pre-build-layout'>
      {/* ── NAV ── */}
      <nav className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b-4 border-black'>
        <div className='max-w-6xl mx-auto flex items-center justify-between px-4 py-3 min-h-[68px] gap-4'>
          {/* BRAND */}
          <Link href='/' className='flex-shrink-0'>
            <span className='text-md sm:text-xl md:text-2xl font-oi uppercase tracking-wide block truncate'>
              QuestBoard
            </span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className='hidden md:flex items-center gap-5 text-sm uppercase opacity-50 font-luckiest flex-shrink'>
            <Link
              href='#features'
              className='hover:opacity-100 transition-opacity whitespace-nowrap'
            >
              Features
            </Link>
            <Link
              href='/board'
              className='hover:opacity-100 transition-opacity whitespace-nowrap'
            >
              Dashboard
            </Link>
            <Link
              href='/workspace'
              className='hover:opacity-100 transition-opacity whitespace-nowrap'
            >
              Workspace
            </Link>
            <Link
              href='/strategies'
              className='hover:opacity-100 transition-opacity whitespace-nowrap'
            >
              Strategies
            </Link>
            <Link
              href='#pricing'
              className='hover:opacity-100 transition-opacity whitespace-nowrap'
            >
              Pricing
            </Link>
          </div>

          {/* AUTH SECTION */}
          <div className='flex items-center gap-2 flex-shrink-0'>
            {isLoading ? (
              // Loading skeleton
              <div className='w-28 sm:w-32 h-10 bg-[#e9edc9] border-4 border-black rounded-xl animate-pulse' />
            ) : isLoggedIn && user ? (
              // ── LOGGED IN STATE ──
              <>
                {/* Go to board shortcut */}
                <Link href='/board' className='hidden sm:block'>
                  <motion.div
                    whileHover={{ scale: 1.04, x: 2, y: 2, boxShadow: 'none' }}
                    whileTap={{ scale: 0.96 }}
                    className='inline-flex items-center gap-1.5 px-4 py-2 border-4 border-black rounded-xl bg-[#ccd5ae] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-sm uppercase cursor-pointer whitespace-nowrap'
                  >
                    <LayoutDashboardIcon size={14} /> Board
                  </motion.div>
                </Link>

                {/* User dropdown */}
                <div className='relative'>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setDropdownOpen((o) => !o)}
                    className='flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 border-4 border-black rounded-xl bg-[#faedcd] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs sm:text-sm uppercase font-luckiest cursor-pointer max-w-[140px] sm:max-w-[200px]'
                  >
                    <div className='w-5 h-5 rounded-lg bg-[#d4a373] border-2 border-black flex items-center justify-center flex-shrink-0'>
                      <UserIcon size={12} />
                    </div>
                    <span className='truncate font-black tracking-tight flex-1 text-left'>
                      {user.codename}
                    </span>
                    <ChevronDownIcon
                      size={13}
                      className={`transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </motion.button>

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <>
                      <div
                        className='fixed inset-0 z-40'
                        onClick={() => setDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className='absolute right-0 mt-2 w-52 bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden'
                      >
                        {/* User info */}
                        <div className='p-4 border-b-2 border-black bg-[#fefae0]'>
                          <p className='text-[10px] opacity-40 uppercase tracking-wider font-sans font-bold'>
                            Logged in as
                          </p>
                          <p className='text-sm uppercase font-black truncate mt-0.5'>
                            {user.codename}
                          </p>
                          <p className='text-[10px] opacity-50 font-sans truncate'>
                            {user.email}
                          </p>
                        </div>

                        {/* Links */}
                        <Link
                          href='/board'
                          onClick={() => setDropdownOpen(false)}
                          className='flex items-center gap-2 px-4 py-3 text-xs uppercase hover:bg-[#ccd5ae]/30 border-b border-black/10 transition-colors font-bold cursor-pointer'
                        >
                          <LayoutDashboardIcon size={14} /> Go to Board
                        </Link>
                        <Link
                          href='/workspace'
                          onClick={() => setDropdownOpen(false)}
                          className='flex items-center gap-2 px-4 py-3 text-xs uppercase hover:bg-[#faedcd]/30 border-b border-black/10 transition-colors font-bold cursor-pointer'
                        >
                          <LayoutDashboardIcon size={14} /> My Workspace
                        </Link>
                        <Link
                          href='/strategies'
                          onClick={() => setDropdownOpen(false)}
                          className='flex items-center gap-2 px-4 py-3 text-xs uppercase hover:bg-[#e9edc9]/30 border-b border-black/10 transition-colors font-bold cursor-pointer'
                        >
                          <CompassIcon size={14} /> Strategies
                        </Link>
                        <Link
                          href='/user'
                          onClick={() => setDropdownOpen(false)}
                          className='flex items-center gap-2 px-4 py-3 text-xs uppercase hover:bg-[#faedcd]/50 border-b border-black/10 transition-colors font-bold cursor-pointer'
                        >
                          <UserIcon size={14} /> My Profile
                        </Link>
                        <button
                          onClick={async () => {
                            setDropdownOpen(false);
                            await logout();
                          }}
                          className='w-full flex items-center gap-2 px-4 py-3 text-xs uppercase text-red-500 hover:bg-red-50 transition-colors font-bold cursor-pointer font-luckiest'
                        >
                          <LogOutIcon size={14} /> Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </div>
              </>
            ) : (
              // ── LOGGED OUT STATE ──
              <>
                {/* Updated Sign In route structure */}
                <Link href='/sign-in'>
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className='px-2.5 sm:px-4 py-2 border-4 border-black rounded-xl bg-[#fefae0] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs sm:text-sm uppercase cursor-pointer whitespace-nowrap'
                  >
                    Sign In
                  </motion.div>
                </Link>
                <Link href='/sign-in'>
                  <motion.div
                    whileHover={{ scale: 1.04, x: 2, y: 2, boxShadow: 'none' }}
                    whileTap={{ scale: 0.96 }}
                    className='px-2.5 sm:px-4 py-2 border-4 border-black rounded-xl bg-[#d4a373] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs sm:text-sm uppercase cursor-pointer whitespace-nowrap'
                  >
                    Get Started
                  </motion.div>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className='min-h-screen bg-[#fefae0] flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-24 pb-12 relative overflow-hidden'
      >
        <CommandMenu />
        <div className='absolute top-32 left-16 w-56 h-56 bg-[#d4a373]/15 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute bottom-24 right-16 w-64 h-64 bg-[#ccd5ae]/25 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute top-1/3 left-1/3 w-32 h-32 bg-[#faedcd]/40 rounded-full blur-2xl pointer-events-none' />

        <motion.div
          style={{ y }}
          className='relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center mt-8 sm:mt-0'
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Badge bg='bg-white'>
              <ZapIcon size={10} /> Track · Complete · Level Up
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='text-6xl md:text-8xl lg:text-[10rem] font-oi uppercase content-title-scale mt-6 mb-6 tracking-tight w-full break-words leading-[0.95]'
          >
            Quest
            <br />
            Board
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='text-xs sm:text-sm md:text-xl font-sans opacity-60 max-w-md mx-auto mb-8 sm:mb-10 leading-relaxed px-2'
          >
            {isLoggedIn && user
              ? `Welcome back, ${user.codename}. Your missions await.`
              : 'Turn your daily tasks into missions. Earn XP, build streaks, and level up — one quest at a time.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xs sm:max-w-none px-4 sm:px-0'
          >
            <Link
              href={isLoggedIn ? '/board' : '/sign-in'}
              className='w-full sm:w-auto'
            >
              <motion.div
                whileHover={{ scale: 1.05, x: 4, y: 4, boxShadow: 'none' }}
                whileTap={{ scale: 0.95 }}
                className='flex items-center justify-center gap-2 bg-[#d4a373] border-4 border-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-lg sm:text-xl uppercase cursor-pointer whitespace-nowrap'
              >
                {isLoggedIn ? 'Enter Board' : 'Start Free'}{' '}
                <ArrowRightIcon size={20} />
              </motion.div>
            </Link>
            {!isLoggedIn && (
              <Link href='/board' className='w-full sm:w-auto'>
                <motion.div
                  whileHover={{ scale: 1.05, x: 4, y: 4, boxShadow: 'none' }}
                  whileTap={{ scale: 0.95 }}
                  className='flex items-center justify-center gap-2 bg-white border-4 border-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-lg sm:text-xl uppercase cursor-pointer whitespace-nowrap'
                >
                  Open App
                </motion.div>
              </Link>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className='text-[10px] uppercase tracking-widest opacity-25 mt-5 font-luckiest'
          >
            Press ⌘K to navigate
          </motion.p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className='relative z-10 mt-10 sm:mt-14 grid grid-cols-3 gap-2.5 sm:gap-4 w-full max-w-md mx-auto px-2'
        >
          {[
            ['10K+', 'Quests Done'],
            ['500+', 'Commanders'],
            ['98%', 'Satisfaction'],
          ].map(([val, label], i) => (
            <div
              key={i}
              className='bg-white border-2 sm:border-4 border-black rounded-2xl p-2.5 sm:p-4 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-0'
            >
              <p className='text-base sm:text-2xl md:text-3xl truncate font-luckiest'>
                {val}
              </p>
              <p className='text-[8px] sm:text-[10px] opacity-45 uppercase tracking-wide font-sans mt-0.5 line-clamp-2 leading-tight'>
                {label}
              </p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section
        id='features'
        className='py-16 sm:py-24 px-4 sm:px-6 bg-[#faedcd] border-y-4 border-black'
      >
        <div className='max-w-6xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center mb-10 sm:mb-14'
          >
            <Badge bg='bg-white'>
              <TargetIcon size={10} /> Features
            </Badge>
            <h2 className='text-3xl sm:text-4xl md:text-6xl font-oi uppercase mt-4 break-words leading-tight'>
              Everything you need
            </h2>
            <p className='font-sans opacity-45 mt-3 max-w-sm mx-auto text-xs sm:text-sm px-4'>
              Built for people who take their goals seriously.
            </p>
          </motion.div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {[
              {
                icon: <LayoutDashboardIcon size={22} />,
                title: 'Main Dashboard',
                desc: 'Track missions with priority levels, durations and status — all in one clean table.',
                bg: 'bg-white',
                iconBg: 'bg-[#faedcd]',
              },
              {
                icon: <FlameIcon size={22} className='text-orange-500' />,
                title: 'Streak System',
                desc: 'Build daily momentum. Complete quests every day to keep your fire alive.',
                bg: 'bg-[#ffadad]/60',
                iconBg: 'bg-white',
              },
              {
                icon: <ZapIcon size={22} />,
                title: 'XP & Levels',
                desc: 'Earn XP per quest. Rise through 10 ranks — Rookie all the way to Commandant.',
                bg: 'bg-white',
                iconBg: 'bg-[#ccd5ae]',
              },
              {
                icon: <BarChart3Icon size={22} />,
                title: 'Stat Center',
                desc: 'Weekly, monthly and yearly performance charts built from your real quest data.',
                bg: 'bg-[#ccd5ae]/70',
                iconBg: 'bg-white',
              },
              {
                icon: <CompassIcon size={22} />,
                title: 'Strategies',
                desc: 'Schedule core missions, bookmark critical deadlines, and layout comprehensive multi-step strategies.',
                bg: 'bg-white',
                iconBg: 'bg-[#faedcd]',
              },
              {
                icon: <TargetIcon size={22} />,
                title: 'Focus Arc',
                desc: 'Pomodoro-style focus timer with iOS drum-scroll time picker and Spotify integration.',
                bg: 'bg-[#e9edc9]/80',
                iconBg: 'bg-white',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <FeatureCard {...f} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className='py-16 sm:py-24 px-4 sm:px-6 bg-white border-b-4 border-black'>
        <div className='max-w-4xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center mb-12 sm:mb-16'
          >
            <Badge bg='bg-[#e9edc9]'>
              <ClockIcon size={10} /> How it works
            </Badge>
            <h2 className='text-3xl sm:text-4xl md:text-6xl font-oi uppercase mt-4'>
              Three steps
            </h2>
          </motion.div>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 md:gap-8'>
            {[
              {
                step: '01',
                title: 'Choose Codename',
                desc: 'Sign up in seconds. Claim your unique operational handle to begin your journey.',
                bg: 'bg-[#faedcd]',
              },
              {
                step: '02',
                title: 'Deploy Quests',
                desc: 'Populate your interactive workspace with strategic missions and prioritized tasks.',
                bg: 'bg-[#ccd5ae]',
              },
              {
                step: '03',
                title: 'Execute & Level',
                desc: 'Complete actions to rack up raw XP, advance your streak fires, and claim higher military ranks.',
                bg: 'bg-[#d4a373]',
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className='text-center flex flex-col items-center'
              >
                <motion.div
                  whileHover={{ rotate: [-2, 2, -2, 0] }}
                  transition={{ duration: 0.4 }}
                  className={`w-20 h-20 sm:w-24 sm:h-24 ${s.bg} border-4 border-black rounded-3xl flex items-center justify-center mb-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-3xl sm:text-4xl font-oi flex-shrink-0`}
                >
                  {s.step}
                </motion.div>
                <h3 className='text-lg sm:text-xl uppercase mb-2 break-words w-full'>
                  {s.title}
                </h3>
                <p className='font-sans text-xs sm:text-sm opacity-50 leading-relaxed max-w-[200px] mx-auto break-words'>
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section
        id='pricing'
        className='py-16 sm:py-24 px-4 sm:px-6 bg-[#e9edc9] border-b-4 border-black'
      >
        <div className='max-w-4xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center mb-10 sm:mb-14'
          >
            <Badge bg='bg-[#faedcd]'>
              <StarIcon size={10} /> Pricing
            </Badge>
            <h2 className='text-3xl sm:text-4xl md:text-6xl font-oi uppercase mt-4 break-words leading-tight'>
              Simple pricing
            </h2>
            <p className='font-sans opacity-45 mt-2 text-xs sm:text-sm'>
              Start free. Upgrade when you are ready.
            </p>
          </motion.div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 max-w-3xl mx-auto items-start'>
            {/* Free Tier */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className='bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full'
            >
              <p className='text-xs uppercase opacity-40 tracking-widest mb-2 font-luckiest'>
                Free Forever
              </p>
              <p className='text-4xl sm:text-5xl font-oi mb-6 uppercase'>
                Free
              </p>
              <ul className='space-y-3 mb-8'>
                {[
                  'Unlimited daily quests',
                  'XP & level system',
                  'Streak tracking',
                  'Weekly charts',
                  'Main dashboard access',
                  'Interactive workspace layout',
                ].map((f, i) => (
                  <li
                    key={i}
                    className='flex items-start gap-2 text-sm font-sans'
                  >
                    <div className='w-5 h-5 rounded-full border-2 border-black bg-[#ccd5ae] flex items-center justify-center flex-shrink-0 mt-0.5'>
                      <CheckIcon size={11} />
                    </div>
                    <span className='opacity-70 flex-1 break-words'>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href='/sign-in'>
                <motion.div
                  whileHover={{ scale: 1.02, x: 3, y: 3, boxShadow: 'none' }}
                  whileTap={{ scale: 0.98 }}
                  className='w-full py-3.5 sm:py-4 bg-[#e9edc9] border-4 border-black rounded-2xl text-center uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer font-luckiest text-sm sm:text-base'
                >
                  Start Free
                </motion.div>
              </Link>
            </motion.div>

            {/* Premium Tier */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className='bg-[#d4a373] border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full'
            >
              <div className='bg-black text-[#fefae0] text-center py-2.5 text-xs uppercase tracking-widest font-luckiest'>
                ⭐ Commander Tier
              </div>
              <div className='p-6 sm:p-8'>
                <p className='text-xs uppercase opacity-60 tracking-widest mb-2 font-luckiest'>
                  Premium
                </p>
                <div className='flex items-end gap-1 mb-6'>
                  <span className='text-4xl sm:text-5xl font-oi leading-none'>
                    $4.99
                  </span>
                  <span className='text-sm opacity-60 mb-1 font-luckiest'>
                    /mo
                  </span>
                </div>
                <ul className='space-y-3 mb-8'>
                  {[
                    'Everything in Free',
                    'Advanced multi-step strategies',
                    'Strategic analytics engine',
                    'PDF tactical log export',
                    'XP multiplier 1.5x',
                    'Commander status profile badge',
                  ].map((f, i) => (
                    <li
                      key={i}
                      className='flex items-start gap-2 text-sm font-sans'
                    >
                      <div className='w-5 h-5 rounded-full border-2 border-black bg-black/20 flex items-center justify-center flex-shrink-0 mt-0.5'>
                        <CheckIcon size={11} className='text-white' />
                      </div>
                      <span className='opacity-90 flex-1 break-words'>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href='/premium'>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 3, y: 3, boxShadow: 'none' }}
                    whileTap={{ scale: 0.98 }}
                    className='w-full py-3.5 sm:py-4 bg-[#fefae0] border-4 border-black rounded-2xl text-center uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer font-luckiest text-sm sm:text-base'
                  >
                    Go Premium
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className='py-16 sm:py-24 px-4 sm:px-6 bg-white border-b-4 border-black'>
        <div className='max-w-5xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center mb-10 sm:mb-12'
          >
            <Badge bg='bg-[#faedcd]'>
              <UsersIcon size={10} /> Testimonials
            </Badge>
            <h2 className='text-3xl sm:text-4xl md:text-5xl font-oi uppercase mt-4 break-words leading-tight'>
              Commanders speak
            </h2>
          </motion.div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
            {[
              {
                name: 'GHOST_OPS',
                rank: 'Captain',
                text: '"QuestBoard turned my messy to-do list into a proper mission log. The streak system keeps me accountable every single day."',
                bg: 'bg-[#faedcd]',
              },
              {
                name: 'NOVA_STRIKE',
                rank: 'Sergeant',
                text: '"The XP system is genuinely motivating. I went from Level 1 to Level 6 in two months just by being consistent."',
                bg: 'bg-[#ccd5ae]',
              },
              {
                name: 'IRON_WOLF',
                rank: 'Colonel',
                text: '"Clean, fast, and fun to use. The strategies center shows me exactly where I am productive and where I am slacking off."',
                bg: 'bg-[#e9edc9]',
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className={`${t.bg} border-4 border-black rounded-2xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between`}
              >
                <p className='font-sans text-sm opacity-65 leading-relaxed mb-5 break-words'>
                  {t.text}
                </p>
                <div className='flex items-center gap-3 mt-auto pt-2'>
                  <div className='w-9 h-9 bg-[#d4a373] border-2 border-black rounded-xl flex items-center justify-center flex-shrink-0'>
                    <TrophyIcon size={16} />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm uppercase leading-tight truncate font-luckiest'>
                      {t.name}
                    </p>
                    <p className='text-[10px] opacity-40 uppercase truncate font-luckiest mt-0.5'>
                      {t.rank}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className='py-20 sm:py-28 px-4 sm:px-6 bg-[#d4a373] border-b-4 border-black'>
        <div className='max-w-3xl mx-auto text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className='text-4xl sm:text-6xl md:text-8xl font-oi uppercase mb-5 leading-[0.95] break-words tracking-tight w-full'>
              Ready
              <br />
              Commander?
            </h2>
            <p className='font-sans opacity-65 mb-8 sm:mb-10 text-base sm:text-lg max-w-md mx-auto px-2 break-words'>
              {isLoggedIn
                ? 'Your tactical missions are waiting inside your workspace.'
                : 'Join hundreds of commanders crushing their daily missions.'}
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-xs sm:max-w-none mx-auto px-4 sm:px-0'>
              <Link
                href={isLoggedIn ? '/board' : '/sign-in'}
                className='w-full sm:w-auto'
              >
                <motion.div
                  whileHover={{ scale: 1.05, x: 4, y: 4, boxShadow: 'none' }}
                  whileTap={{ scale: 0.95 }}
                  className='w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#fefae0] border-4 border-black px-6 sm:px-10 py-4 sm:py-5 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-xl sm:text-2xl uppercase cursor-pointer whitespace-nowrap'
                >
                  {isLoggedIn ? 'Enter Board' : 'Start Free'}{' '}
                  <ArrowRightIcon size={24} />
                </motion.div>
              </Link>
              {!isLoggedIn && (
                <Link href='/premium' className='w-full sm:w-auto'>
                  <motion.div
                    whileHover={{ scale: 1.05, x: 4, y: 4, boxShadow: 'none' }}
                    whileTap={{ scale: 0.95 }}
                    className='w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-black text-[#fefae0] border-4 border-black px-6 sm:px-10 py-4 sm:py-5 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-xl sm:text-2xl uppercase cursor-pointer whitespace-nowrap'
                  >
                    <StarIcon size={22} /> Go Premium
                  </motion.div>
                </Link>
              )}
            </div>
            <p className='font-sans text-[10px] sm:text-xs opacity-40 mt-5 uppercase tracking-widest'>
              Free forever · No credit card needed
            </p>
          </motion.div>
        </div>
      </section>
      {/* — FOOTER — */}
      <footer className='border-t-4 border-black bg-[#fefae0] px-4 sm:px-6 py-8'>
        <div className='max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4'>
          <span className='text-2xl font-oi uppercase flex-shrink-0'>
            QuestBoard
          </span>

          <div className='flex flex-wrap justify-center items-center gap-x-5 gap-y-2.5 text-xs uppercase opacity-40 font-luckiest'>
            {[
              ['App', '/board'],
              ['Strategies', '/strategies'],
              ['Workspace', '/workspace'],
              ['Focus', '/focus'],
              ['Premium', '/premium'],
              ['Terms', '/terms'],
              ['Privacy', '/privacy'],
              ['Login', '/login'],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className='hover:opacity-100 transition-opacity whitespace-nowrap'
              >
                {label}
              </Link>
            ))}
          </div>

          <p className='font-sans text-xs opacity-25 text-center md:text-right flex-shrink-0'>
            &copy; 2026 QuestBoard. All rights reserved.
          </p>
        </div>
      </footer>

      {/* — RESPONSIVE COMPONENT LAYOUT TWEAKS — */}
      <style jsx global>{`
        @media (max-width: 639px) {
          .content-title-scale {
            font-size: clamp(2.5rem, 12vw, 4.5rem) !important;
          }
          h2.font-oi {
            font-size: clamp(1.75rem, 8vw, 3rem) !important;
          }
        }
      `}</style>
    </div>
  );
}
