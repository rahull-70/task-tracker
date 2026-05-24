'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import {
  ZapIcon,
  FlameIcon,
  BarChart3Icon,
  CalendarIcon,
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon,
  CheckIcon,
  TrophyIcon,
  TargetIcon,
  UsersIcon,
  ClockIcon,
  TreesIcon,
} from 'lucide-react';

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
    className={`${bg} border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3`}
  >
    <div
      className={`w-12 h-12 ${iconBg} border-2 border-black rounded-xl flex items-center justify-center`}
    >
      {icon}
    </div>
    <h3 className='text-xl font-luckiest uppercase'>{title}</h3>
    <p className='text-sm font-sans opacity-60 leading-relaxed'>{desc}</p>
  </motion.div>
);

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <div className='min-h-screen font-luckiest overflow-x-hidden'>
      {/* NAV — white */}
      <nav className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b-4 border-black'>
        <div className='max-w-6xl mx-auto flex items-center justify-between px-6 py-3'>
          <span className='text-2xl font-oi uppercase tracking-wide'>
            QuestBoard
          </span>
          <div className='hidden md:flex items-center gap-5 text-sm uppercase opacity-50 font-luckiest'>
            <Link
              href='#features'
              className='hover:opacity-100 transition-opacity cursor-pointer'
            >
              Features
            </Link>
            <Link
              href='#pricing'
              className='hover:opacity-100 transition-opacity cursor-pointer'
            >
              Pricing
            </Link>
            <Link
              href='/garden'
              className='hover:opacity-100 transition-opacity cursor-pointer'
            >
              Garden
            </Link>
          </div>
          <div className='flex items-center gap-3'>
            <Link href='/login'>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className='px-4 py-2 border-4 border-black rounded-xl bg-[#fefae0] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-sm uppercase cursor-pointer'
              >
                Sign In
              </motion.div>
            </Link>
            <Link href='/sign-in'>
              <motion.div
                whileHover={{ scale: 1.04, x: 2, y: 2, boxShadow: 'none' }}
                whileTap={{ scale: 0.96 }}
                className='px-4 py-2 border-4 border-black rounded-xl bg-[#d4a373] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-sm uppercase cursor-pointer'
              >
                Get Started
              </motion.div>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO — warm cornsilk ── */}
      <section
        ref={heroRef}
        className='min-h-screen bg-[#fefae0] flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 relative overflow-hidden'
      >
        {/* Decorative blobs */}
        <div className='absolute top-32 left-16 w-56 h-56 bg-[#d4a373]/15 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute bottom-24 right-16 w-64 h-64 bg-[#ccd5ae]/25 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute top-1/3 left-1/3 w-32 h-32 bg-[#faedcd]/40 rounded-full blur-2xl pointer-events-none' />

        <motion.div style={{ y }} className='relative z-10 max-w-4xl mx-auto'>
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
            className='text-7xl md:text-[10rem] font-oi uppercase leading-none mt-5 mb-5'
          >
            Quest
            <br />
            Board
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='text-base md:text-xl font-sans opacity-55 max-w-lg mx-auto mb-10 leading-relaxed'
          >
            Turn your daily tasks into missions. Earn XP, build streaks, and
            level up your productivity — one quest at a time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='flex flex-col sm:flex-row gap-4 justify-center'
          >
            <Link href='/sign-in'>
              <motion.div
                whileHover={{ scale: 1.05, x: 4, y: 4, boxShadow: 'none' }}
                whileTap={{ scale: 0.95 }}
                className='flex items-center justify-center gap-2 bg-[#d4a373] border-4 border-black px-8 py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-xl uppercase cursor-pointer'
              >
                Start Free <ArrowRightIcon size={20} />
              </motion.div>
            </Link>
            <Link href='/board'>
              <motion.div
                whileHover={{ scale: 1.05, x: 4, y: 4, boxShadow: 'none' }}
                whileTap={{ scale: 0.95 }}
                className='flex items-center justify-center gap-2 bg-white border-4 border-black px-8 py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-xl uppercase cursor-pointer'
              >
                Open App
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className='relative z-10 mt-16 grid grid-cols-3 gap-4 max-w-md mx-auto'
        >
          {[
            ['10K+', 'Quests Done'],
            ['500+', 'Commanders'],
            ['98%', 'Satisfaction'],
          ].map(([val, label], i) => (
            <div
              key={i}
              className='bg-white border-4 border-black rounded-2xl p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            >
              <p className='text-2xl md:text-3xl'>{val}</p>
              <p className='text-[10px] opacity-45 uppercase tracking-wide font-sans mt-0.5'>
                {label}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 1.2,
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 1.5,
          }}
          className='absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase opacity-25 tracking-widest'
        >
          Scroll to explore ↓
        </motion.p>
      </section>

      {/* ── FEATURES — papaya beige ── */}
      <section
        id='features'
        className='py-24 px-6 bg-[#faedcd] border-y-4 border-black'
      >
        <div className='max-w-6xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center mb-14'
          >
            <Badge bg='bg-white'>
              <TargetIcon size={10} /> Features
            </Badge>
            <h2 className='text-4xl md:text-6xl font-oi uppercase mt-4'>
              Everything you need
            </h2>
            <p className='font-sans opacity-45 mt-3 max-w-sm mx-auto text-sm'>
              Built for people who take their goals seriously.
            </p>
          </motion.div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
            {[
              {
                icon: <TargetIcon size={22} />,
                title: 'Daily Quests',
                desc: 'Set and track missions with priority levels, durations and status — all in one clean table.',
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
                icon: <CalendarIcon size={22} />,
                title: 'Calendar & Plans',
                desc: 'Schedule missions, bookmark important dates, and manage multi-step plans.',
                bg: 'bg-white',
                iconBg: 'bg-[#faedcd]',
              },
              {
                icon: <TreesIcon size={22} />,
                title: 'Zen Garden',
                desc: 'Your personal escape. Walk with cats, dogs and birds in a fully interactive garden.',
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

      {/* ── HOW IT WORKS — white ── */}
      <section className='py-24 px-6 bg-white border-b-4 border-black'>
        <div className='max-w-4xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center mb-16'
          >
            <Badge bg='bg-[#e9edc9]'>
              <ClockIcon size={10} /> How it works
            </Badge>
            <h2 className='text-4xl md:text-6xl font-oi uppercase mt-4'>
              Three steps
            </h2>
          </motion.div>
          <div className='grid md:grid-cols-3 gap-8'>
            {[
              {
                step: '01',
                title: 'Create Account',
                desc: 'Sign up in seconds. Choose your codename and start your journey.',
                bg: 'bg-[#faedcd]',
              },
              {
                step: '02',
                title: 'Add Quests',
                desc: 'Create daily missions with priorities, durations and status tracking.',
                bg: 'bg-[#ccd5ae]',
              },
              {
                step: '03',
                title: 'Level Up',
                desc: 'Complete quests to earn XP, build streaks, and climb the ranks.',
                bg: 'bg-[#d4a373]',
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className='text-center'
              >
                <motion.div
                  whileHover={{ rotate: [-2, 2, -2, 0] }}
                  transition={{ duration: 0.4 }}
                  className={`w-24 h-24 ${s.bg} border-4 border-black rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-4xl font-oi`}
                >
                  {s.step}
                </motion.div>
                <h3 className='text-xl uppercase mb-2'>{s.title}</h3>
                <p className='font-sans text-sm opacity-50 leading-relaxed max-w-[200px] mx-auto'>
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING — beige ── */}
      <section
        id='pricing'
        className='py-24 px-6 bg-[#e9edc9] border-b-4 border-black'
      >
        <div className='max-w-4xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center mb-14'
          >
            <Badge bg='bg-[#faedcd]'>
              <StarIcon size={10} /> Pricing
            </Badge>
            <h2 className='text-4xl md:text-6xl font-oi uppercase mt-4'>
              Simple pricing
            </h2>
            <p className='font-sans opacity-45 mt-2 text-sm'>
              Start free. Upgrade when you are ready.
            </p>
          </motion.div>
          <div className='grid md:grid-cols-2 gap-6 max-w-3xl mx-auto'>
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className='bg-white border-4 border-black rounded-3xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
            >
              <p className='text-xs uppercase opacity-40 tracking-widest mb-2'>
                Free Forever
              </p>
              <p className='text-5xl font-oi mb-6'>Free</p>
              <ul className='space-y-2.5 mb-8'>
                {[
                  'Unlimited daily quests',
                  'XP & level system',
                  'Streak tracking',
                  'Weekly charts',
                  'Zen Garden',
                  'Stat center',
                ].map((f, i) => (
                  <li
                    key={i}
                    className='flex items-center gap-2 text-sm font-sans'
                  >
                    <div className='w-5 h-5 rounded-full border-2 border-black bg-[#ccd5ae] flex items-center justify-center flex-shrink-0'>
                      <CheckIcon size={11} />
                    </div>
                    <span className='opacity-70'>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href='/sign-in'>
                <motion.div
                  whileHover={{ scale: 1.02, x: 3, y: 3, boxShadow: 'none' }}
                  whileTap={{ scale: 0.98 }}
                  className='w-full py-4 bg-[#e9edc9] border-4 border-black rounded-2xl text-center uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer'
                >
                  Start Free
                </motion.div>
              </Link>
            </motion.div>

            {/* Premium */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className='bg-[#d4a373] border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
            >
              <div className='bg-black text-[#fefae0] text-center py-2.5 text-xs uppercase tracking-widest'>
                ⭐ Commander Tier
              </div>
              <div className='p-8'>
                <p className='text-xs uppercase opacity-60 tracking-widest mb-2'>
                  Premium
                </p>
                <div className='flex items-end gap-1 mb-6'>
                  <span className='text-5xl font-oi'>$4.99</span>
                  <span className='text-sm opacity-60 mb-1.5'>/mo</span>
                </div>
                <ul className='space-y-2.5 mb-8'>
                  {[
                    'Everything in Free',
                    'PDF export',
                    'Advanced analytics',
                    'Calendar planner',
                    'Plans board',
                    'XP multiplier 1.5x',
                    'Commander badge',
                  ].map((f, i) => (
                    <li
                      key={i}
                      className='flex items-center gap-2 text-sm font-sans'
                    >
                      <div className='w-5 h-5 rounded-full border-2 border-black bg-black/20 flex items-center justify-center flex-shrink-0'>
                        <CheckIcon size={11} className='text-white' />
                      </div>
                      <span className='opacity-90'>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href='/premium'>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 3, y: 3, boxShadow: 'none' }}
                    whileTap={{ scale: 0.98 }}
                    className='w-full py-4 bg-[#fefae0] border-4 border-black rounded-2xl text-center uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer'
                  >
                    Go Premium
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — white ── */}
      <section className='py-24 px-6 bg-white border-b-4 border-black'>
        <div className='max-w-5xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center mb-12'
          >
            <Badge bg='bg-[#faedcd]'>
              <UsersIcon size={10} /> Testimonials
            </Badge>
            <h2 className='text-4xl md:text-5xl font-oi uppercase mt-4'>
              Commanders speak
            </h2>
          </motion.div>
          <div className='grid md:grid-cols-3 gap-5'>
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
                text: '"Clean, fast, and fun to use. The stat center shows me exactly where I am productive and where I am slacking off."',
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
                className={`${t.bg} border-4 border-black rounded-2xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]`}
              >
                <p className='font-sans text-sm opacity-65 leading-relaxed mb-5'>
                  {t.text}
                </p>
                <div className='flex items-center gap-3'>
                  <div className='w-9 h-9 bg-[#d4a373] border-2 border-black rounded-xl flex items-center justify-center'>
                    <TrophyIcon size={16} />
                  </div>
                  <div>
                    <p className='text-sm uppercase leading-tight'>{t.name}</p>
                    <p className='text-[10px] opacity-40 uppercase'>{t.rank}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA — light bronze warm ── */}
      <section className='py-28 px-6 bg-[#d4a373] border-b-4 border-black'>
        <div className='max-w-3xl mx-auto text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className='text-6xl md:text-8xl font-oi uppercase mb-5 leading-none'>
              Ready
              <br />
              Commander?
            </h2>
            <p className='font-sans opacity-65 mb-10 text-lg'>
              Join hundreds of commanders crushing their daily missions.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link href='/sign-in'>
                <motion.div
                  whileHover={{ scale: 1.05, x: 4, y: 4, boxShadow: 'none' }}
                  whileTap={{ scale: 0.95 }}
                  className='inline-flex items-center gap-3 bg-[#fefae0] border-4 border-black px-10 py-5 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-2xl uppercase cursor-pointer'
                >
                  Start Free <ArrowRightIcon size={24} />
                </motion.div>
              </Link>
              <Link href='/premium'>
                <motion.div
                  whileHover={{ scale: 1.05, x: 4, y: 4, boxShadow: 'none' }}
                  whileTap={{ scale: 0.95 }}
                  className='inline-flex items-center gap-3 bg-black text-[#fefae0] border-4 border-black px-10 py-5 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-2xl uppercase cursor-pointer'
                >
                  <StarIcon size={22} /> Go Premium
                </motion.div>
              </Link>
            </div>
            <p className='font-sans text-xs opacity-40 mt-5 uppercase tracking-widest'>
              Free forever · No credit card needed
            </p>
          </motion.div>
        </div>
      </section>

      {/* FOOTER — cornsilk */}
      <footer className='border-t-4 border-black bg-[#fefae0] px-6 py-8'>
        <div className='max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4'>
          <span className='text-2xl font-oi uppercase'>QuestBoard</span>
          <div className='flex flex-wrap items-center gap-5 text-xs uppercase opacity-40 font-luckiest'>
            {[
              ['App', '/board'],
              ['Calendar', '/calendar'],
              ['Plans', '/plans'],
              ['Garden', '/garden'],
              ['Premium', '/premium'],
              ['Login', '/login'],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className='hover:opacity-100 transition-opacity'
              >
                {label}
              </Link>
            ))}
          </div>
          <p className='font-sans text-xs opacity-25'>
            © 2026 QuestBoard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
