'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeftIcon, StarIcon, CheckIcon, ZapIcon, DownloadIcon,
  BarChart3Icon, CalendarIcon, ShieldCheckIcon, TrophyIcon,
  XIcon,
} from 'lucide-react';

const features = [
  { icon: <DownloadIcon size={20} />, title: 'PDF Export', desc: 'Download your full mission debrief as a polished PDF. Share your progress anywhere.', color: 'bg-[#faedcd]' },
  { icon: <BarChart3Icon size={20} />, title: 'Advanced Analytics', desc: 'Unlock deep insights — heatmaps, completion trends, and productivity scores.', color: 'bg-[#ccd5ae]' },
  { icon: <CalendarIcon size={20} />, title: 'Calendar Planner', desc: 'Full calendar with event scheduling, reminders, and weekly planning tools.', color: 'bg-[#e9edc9]' },
  { icon: <ShieldCheckIcon size={20} />, title: 'Priority Support', desc: 'Get help fast. Premium commanders jump the queue with dedicated support.', color: 'bg-[#faedcd]' },
  { icon: <TrophyIcon size={20} />, title: 'Commander Badge', desc: 'Exclusive gold badge on your profile. Show off your elite status.', color: 'bg-[#d4a373]' },
  { icon: <ZapIcon size={20} />, title: 'XP Multiplier', desc: '1.5x XP on all completed quests. Level up faster than anyone.', color: 'bg-[#ccd5ae]' },
];

const faqs = [
  { q: 'Can I cancel anytime?', a: 'Yes — cancel from your profile at any time. No questions asked. Your data stays safe.' },
  { q: 'What happens to my data if I downgrade?', a: 'All your quests, XP and stats remain. You just lose access to premium features.' },
  { q: 'Is there a free trial?', a: 'The free plan is forever free with no limits on quests. Upgrade when you are ready.' },
  { q: 'Do you offer student discounts?', a: 'Email us with your student ID and we will hook you up with 50% off.' },
];

export default function PremiumPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const price = billing === 'monthly' ? '4.99' : '3.99';
  const yearlyTotal = (parseFloat(price) * 12).toFixed(2);

  return (
    <div className='min-h-screen bg-[#fefae0] font-luckiest overflow-x-hidden selection:bg-black/10 text-black'>

      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -60, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -60, x: '-50%' }}
            className='fixed top-6 left-1/2 z-50 bg-[#ccd5ae] border-4 border-black px-4 sm:px-6 py-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 w-[90%] max-w-md justify-between'
          >
            <div className="flex items-center gap-2">
              <CheckIcon size={18} className="flex-shrink-0" />
              <span className='uppercase text-xs sm:text-sm leading-tight'>Welcome to Premium, Commander!</span>
            </div>
            <button onClick={() => setShowSuccess(false)} className="p-1 flex-shrink-0 cursor-pointer"><XIcon size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAV */}
      <div className='flex flex-col sm:flex-row items-center justify-between px-4 md:px-10 py-4 gap-3 border-b-4 border-black bg-white sticky top-0 z-40 w-full'>
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <Link href='/'>
            <motion.div whileHover={{ scale: 1.04, x: 3, y: 3, boxShadow: 'none' }} whileTap={{ scale: 0.96 }}
              className='flex items-center gap-2 bg-[#e9edc9] border-4 border-black px-3 sm:px-4 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-xs sm:text-sm uppercase whitespace-nowrap'>
              <ArrowLeftIcon size={14} /> Back
            </motion.div>
          </Link>
          <span className='text-base font-oi uppercase block sm:hidden truncate max-w-[150px]'>Premium</span>
          <Link href='/board' className="block sm:hidden">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className='px-3 py-2 border-4 border-black rounded-xl bg-[#d4a373] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs uppercase cursor-pointer whitespace-nowrap'>
              App
            </motion.div>
          </Link>
        </div>
        <span className='text-xl md:text-2xl font-oi uppercase hidden sm:block tracking-tight'>QuestBoard Premium</span>
        <Link href='/board' className="hidden sm:block">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className='px-4 py-2 border-4 border-black rounded-xl bg-[#d4a373] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-sm uppercase cursor-pointer whitespace-nowrap'>
            Go to App
          </motion.div>
        </Link>
      </div>

      {/* HERO */}
      <section className='py-12 sm:py-20 px-4 sm:px-6 text-center relative overflow-hidden bg-[#faedcd] border-b-4 border-black'>
        <div className='absolute inset-0 pointer-events-none'>
          <div className='absolute top-10 left-20 w-48 h-48 bg-[#d4a373]/20 rounded-full blur-3xl' />
          <div className='absolute bottom-10 right-20 w-56 h-56 bg-[#ccd5ae]/30 rounded-full blur-3xl' />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className='relative z-10 w-full max-w-3xl mx-auto'>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className='inline-block mb-4 sm:mb-6'
          >
            <div className='w-16 h-16 sm:w-24 sm:h-24 bg-[#d4a373] border-4 border-black rounded-3xl flex items-center justify-center mx-auto shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'>
              <StarIcon size={32} className='text-white fill-current sm:hidden' />
              <StarIcon size={48} className='text-white fill-current hidden sm:block' />
            </div>
          </motion.div>
          <h1 className='text-4xl sm:text-6xl md:text-8xl font-oi uppercase mb-4 leading-[0.95] tracking-tight break-words max-w-full'>
            Go<br className="sm:hidden" /> Premium
          </h1>
          <p className='font-sans opacity-70 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed px-2'>
            Unlock the full arsenal. Level up faster, plan smarter, and export your mission data like a true commander.
          </p>
        </motion.div>
      </section>

      {/* PRICING TOGGLE */}
      <section className='py-12 sm:py-16 px-4 sm:px-6 bg-[#e9edc9] border-b-4 border-black'>
        <div className='max-w-2xl mx-auto w-full'>
          {/* Toggle */}
          <div className='flex items-center justify-center gap-3 mb-8 flex-wrap'>
            <span className={`text-xs sm:text-sm uppercase ${billing === 'monthly' ? 'opacity-100' : 'opacity-40'}`}>Monthly</span>
            <motion.button
              onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}
              className='w-14 h-7 sm:w-16 sm:h-8 bg-[#d4a373] border-4 border-black rounded-full relative cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0'
            >
              <motion.div
                animate={{ x: billing === 'yearly' ? 28 : 2 }}
                className='absolute top-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-white border-2 border-black rounded-full'
              />
            </motion.button>
            <span className={`text-xs sm:text-sm uppercase flex items-center gap-1.5 ${billing === 'yearly' ? 'opacity-100' : 'opacity-40'}`}>
              Yearly
              <span className='bg-[#ccd5ae] border border-black px-1.5 py-0.5 rounded-full text-[10px] font-bold normal-case sm:uppercase whitespace-nowrap'>Save 20%</span>
            </span>
          </div>

          {/* Price card */}
          <motion.div
            layout
            className='bg-[#d4a373] border-4 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] w-full'
          >
            <div className='bg-black text-[#faedcd] text-center py-2.5 sm:py-3 text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 px-3'>
              <StarIcon size={12} className="fill-current" /> Commander Tier — Most Popular
            </div>
            <div className='p-5 sm:p-8 md:p-10 w-full'>
              <div className='flex items-end justify-center sm:justify-start gap-1.5 mb-2 flex-wrap'>
                <span className='text-5xl sm:text-7xl md:text-8xl font-oi leading-none tracking-tighter'>${price}</span>
                <span className='text-sm sm:text-lg opacity-70 mb-1 sm:mb-3 font-luckiest uppercase whitespace-nowrap'>/month</span>
              </div>
              {billing === 'yearly' && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className='text-xs sm:text-sm opacity-80 mb-6 font-sans text-center sm:text-left font-semibold'>
                  Billed as ${yearlyTotal}/year — you save $12/year
                </motion.p>
              )}

              {/* Features list */}
              <ul className='space-y-3 mb-8 border-t-2 border-black/10 pt-4 sm:pt-0 sm:border-0'>
                {features.map((f, i) => (
                  <li key={i} className='flex items-center gap-3 min-w-0'>
                    <div className='w-5 h-5 sm:w-6 sm:h-6 bg-black rounded-lg flex items-center justify-center flex-shrink-0'>
                      <CheckIcon size={12} className='text-[#faedcd]' />
                    </div>
                    <span className='text-xs sm:text-sm font-luckiest uppercase truncate flex-1'>{f.title}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02, x: 4, y: 4, boxShadow: 'none' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSuccess(true)}
                className='w-full bg-[#fefae0] border-4 border-black py-3.5 sm:py-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-lg sm:text-xl uppercase cursor-pointer font-luckiest leading-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
              >
                Upgrade Now — ${price}/mo
              </motion.button>
              <p className='text-[10px] sm:text-xs opacity-60 text-center mt-4 font-sans uppercase tracking-wider font-bold'>
                Cancel anytime · No credit card surprises
              </p>
            </div>
          </motion.div>

          {/* Free comparison */}
          <div className='mt-6 bg-white border-4 border-black rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full'>
            <p className='text-[11px] sm:text-sm uppercase opacity-50 mb-1.5 font-bold'>Already on Free plan</p>
            <div className='flex items-center justify-between gap-4 flex-wrap'>
              <span className='text-base sm:text-lg uppercase'>Free Forever</span>
              <Link href='/sign-in'>
                <span className='text-xs sm:text-sm text-[#d4a373] border-b-2 border-[#d4a373] uppercase cursor-pointer hover:opacity-70 font-bold whitespace-nowrap'>
                  Sign up free →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE DEEP DIVE */}
      <section className='py-12 sm:py-20 px-4 sm:px-6 bg-[#fefae0]'>
        <div className='max-w-5xl mx-auto'>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className='text-center mb-10 sm:mb-14 px-2'>
            <h2 className='text-3xl sm:text-5xl md:text-6xl font-oi uppercase tracking-tight'>What you unlock</h2>
            <p className='font-sans opacity-60 mt-3 text-sm sm:text-base font-semibold'>Every premium feature, explained.</p>
          </motion.div>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'>
            {features.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className={`${f.color} border-4 border-black rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] min-w-0`}
              >
                <div className='w-9 h-9 sm:w-10 sm:h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center mb-4 flex-shrink-0'>
                  {f.icon}
                </div>
                <h3 className='text-base sm:text-lg uppercase mb-1.5 truncate'>{f.title}</h3>
                <p className='font-sans text-xs sm:text-sm opacity-70 leading-relaxed font-medium'>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMANDER BADGE SHOWCASE */}
      <section className='py-12 sm:py-20 px-4 sm:px-6 bg-[#ccd5ae] border-y-4 border-black'>
        <div className='max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left'>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className='flex-shrink-0'
          >
            <div className='w-40 h-40 sm:w-48 sm:h-48 bg-[#d4a373] border-4 border-black rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center gap-2.5 relative overflow-hidden'>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className='absolute inset-2.5 sm:inset-3 border-4 border-dashed border-black/20 rounded-2xl pointer-events-none' />
              <StarIcon size={40} className='text-white fill-current' />
              <span className='text-white text-base sm:text-lg uppercase'>Commander</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 w-full flex flex-col items-center md:items-start">
            <h2 className='text-3xl sm:text-4xl md:text-5xl font-oi uppercase mb-3 tracking-tight'>Exclusive Badge</h2>
            <p className='font-sans opacity-70 text-sm sm:text-base leading-relaxed mb-6 font-medium max-w-xl'>
              Premium commanders get a gold badge on their profile — visible in the stat center and user page. Show the world you are serious about your goals.
            </p>
            <div className='flex items-center gap-3 bg-white border-4 border-black rounded-2xl p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-xs text-left'>
              <div className='w-9 h-9 sm:w-10 sm:h-10 bg-[#d4a373] border-2 border-black rounded-xl flex items-center justify-center flex-shrink-0'>
                <StarIcon size={16} className='text-white fill-current' />
              </div>
              <div className="min-w-0 flex-1">
                <p className='text-xs sm:text-sm uppercase truncate font-black'>GHOST_OPERATOR</p>
                <p className='text-[10px] opacity-50 uppercase tracking-tight truncate font-bold mt-0.5'>⭐ Premium Commander · LVL 8</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className='py-12 sm:py-20 px-4 sm:px-6 bg-[#fefae0]'>
        <div className='max-w-2xl mx-auto w-full'>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className='text-center mb-8 sm:mb-12'>
            <h2 className='text-3xl sm:text-4xl font-oi uppercase'>Questions?</h2>
          </motion.div>
          <div className='space-y-3 w-full'>
            {faqs.map((faq, i) => (
              <motion.div key={i} layout
                className='bg-white border-4 border-black rounded-2xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full'
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className='w-full flex items-center justify-between px-4 sm:px-6 py-4 cursor-pointer text-left gap-3'
                >
                  <span className='uppercase text-xs sm:text-sm font-luckiest leading-snug'>{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 45 : 0 }} className="flex-shrink-0">
                    <ZapIcon size={14} className={openFaq === i ? 'text-[#d4a373] fill-current' : 'opacity-30'} />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className='border-t-2 border-black/10 px-4 sm:px-6 py-4 bg-[#fefae0]'
                    >
                      <p className='font-sans text-xs sm:text-sm opacity-70 leading-relaxed font-medium'>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className='py-16 sm:py-20 px-4 sm:px-6 bg-[#faedcd] border-t-4 border-black text-center'>
        <div className='max-w-2xl mx-auto w-full'>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className='text-3xl sm:text-5xl font-oi uppercase mb-3 tracking-tight break-words max-w-full'>Ready, Commander?</h2>
            <p className='font-sans opacity-60 mb-8 text-sm sm:text-base font-semibold'>Join the elite. Upgrade today.</p>
            <motion.button
              whileHover={{ scale: 1.03, x: 4, y: 4, boxShadow: 'none' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowSuccess(true)}
              className='inline-flex items-center justify-center gap-2.5 bg-[#d4a373] border-4 border-black px-6 sm:px-10 py-4 sm:py-5 rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-lg sm:text-2xl uppercase cursor-pointer max-w-full leading-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
            >
              <StarIcon size={20} className="fill-current flex-shrink-0" /> Upgrade to Premium
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className='border-t-4 border-black bg-[#fefae0] px-4 sm:px-6 py-6'>
        <div className='max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left'>
          <span className='font-oi text-lg sm:text-xl uppercase tracking-tight'>QuestBoard</span>
          <p className='font-sans text-[10px] sm:text-xs opacity-40 font-bold'>© 2026 QuestBoard · All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}